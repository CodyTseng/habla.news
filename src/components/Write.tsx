import { useState } from "react";

import {
  Flex,
  Button,
  IconButton,
  Heading,
  Menu,
  MenuDivider,
  MenuButton,
  MenuList,
  MenuGroup,
  MenuItem,
} from "@chakra-ui/react";
import { AddIcon, HamburgerIcon, ViewIcon, EditIcon } from "@chakra-ui/icons";

import { getMetadata } from "@habla/nip23";
import { LONG_FORM, LONG_FORM_DRAFT } from "@habla/const";
import { useEvents } from "@habla/nostr/hooks";
import Events from "@habla/components/nostr/feed/Events";
import Editor from "@habla/markdown/Editor";

export default function Write({ pubkey }) {
  const [showPreview, setShowPreview] = useState(false);
  const [event, setEvent] = useState();
  const { events } = useEvents(
    {
      kinds: [LONG_FORM, LONG_FORM_DRAFT],
      authors: [pubkey],
    },
    {
      closeOnEose: true,
      cacheUsage: "PARALLEL",
    }
  );
  const posts = events.filter((e) => e.kind === LONG_FORM);
  const published = posts.map((e) => getMetadata(e).identifier);
  const drafts = events.filter((e) => {
    const publishedArticle = posts.find(
      (p) => getMetadata(p).identifier === getMetadata(e).identifier
    );
    const shouldShowDraft =
      !publishedArticle || publishedArticle.created_at < e.created_at;
    return e.kind === LONG_FORM_DRAFT && shouldShowDraft;
  });
  return (
    <>
      <Flex alignItems="center" justifyContent="space-between">
        {showPreview ? (
          <IconButton
            icon={<EditIcon />}
            size="lg"
            aria-label="Edit"
            onClick={() => setShowPreview(false)}
            variant="outline"
          />
        ) : (
          <IconButton
            icon={<ViewIcon />}
            size="lg"
            aria-label="Preview"
            onClick={() => setShowPreview(true)}
            variant="outline"
          />
        )}
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label="Options"
            icon={<HamburgerIcon />}
            variant="outline"
          />
          <MenuList maxW="90vw">
            <MenuItem icon={<AddIcon />} onClick={() => setEvent()}>
              New
            </MenuItem>
            <MenuDivider />
            {drafts.length > 0 && (
              <>
                <MenuGroup title="Drafts">
                  {drafts.map((d) => (
                    <MenuItem key={d.id} onClick={() => setEvent(d)}>
                      {getMetadata(d).title}
                    </MenuItem>
                  ))}
                </MenuGroup>
                <MenuDivider />
              </>
            )}
            <MenuGroup title="Posts">
              {posts.map((p) => (
                <MenuItem
                  sx={{ wordBreak: "break-word" }}
                  key={p.id}
                  onClick={() => setEvent(p)}
                >
                  {getMetadata(p).title}
                </MenuItem>
              ))}
            </MenuGroup>
          </MenuList>
        </Menu>
      </Flex>
      <Editor key={event?.id} showPreview={showPreview} event={event} />
    </>
  );
}
