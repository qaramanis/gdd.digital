import Mention from "@tiptap/extension-mention";
import { ReactRenderer } from "@tiptap/react";
import tippy, { type Instance as TippyInstance } from "tippy.js";
import {
  MentionSuggestion,
  type MentionSuggestionRef,
} from "@/components/gdd/mention-suggestion";
import type { MentionItem } from "./types";
import type { SuggestionProps, SuggestionKeyDownProps } from "@tiptap/suggestion";

export interface MentionExtensionOptions {
  getItems: (query: string) => MentionItem[];
}

export function createMentionExtension({ getItems }: MentionExtensionOptions) {
  return Mention.extend({
    addAttributes() {
      return {
        id: {
          default: null,
          parseHTML: (element) => element.getAttribute("data-id"),
          renderHTML: (attributes) => {
            if (!attributes.id) return {};
            return { "data-id": attributes.id };
          },
        },
        label: {
          default: null,
          parseHTML: (element) => {
            // Extract label from text content, removing the @ prefix
            const text = element.textContent || "";
            return text.startsWith("@") ? text.slice(1) : text;
          },
          renderHTML: () => ({}),
        },
        type: {
          default: "default",
          parseHTML: (element) => element.getAttribute("data-type") || "default",
          renderHTML: (attributes) => {
            return { "data-type": attributes.type };
          },
        },
      };
    },
    parseHTML() {
      return [
        {
          tag: "span.mention",
        },
        {
          tag: "span[data-type]",
          getAttrs: (element) => {
            const el = element as HTMLElement;
            // Only parse if it has the mention class or data-id attribute
            if (!el.classList.contains("mention") && !el.hasAttribute("data-id")) {
              return false;
            }
            return null;
          },
        },
      ];
    },
    renderHTML({ node, HTMLAttributes }) {
      return [
        "span",
        {
          ...HTMLAttributes,
          class: `mention mention-${node.attrs.type || "default"}`,
          "data-type": node.attrs.type || "default",
          "data-id": node.attrs.id,
        },
        `@${node.attrs.label ?? node.attrs.id}`,
      ];
    },
  }).configure({
    HTMLAttributes: {
      class: "mention",
    },
    suggestion: {
      char: "@",
      items: ({ query }: { query: string }) => {
        return getItems(query);
      },
      render: () => {
        let component: ReactRenderer<MentionSuggestionRef> | null = null;
        let popup: TippyInstance[] | null = null;

        return {
          onStart: (props: SuggestionProps<MentionItem>) => {
            component = new ReactRenderer(MentionSuggestion, {
              props: {
                items: props.items,
                command: (item: MentionItem) => {
                  props.command({
                    id: item.id,
                    label: item.name,
                    type: item.type,
                  });
                },
              },
              editor: props.editor,
            });

            if (!props.clientRect) {
              return;
            }

            popup = tippy("body", {
              getReferenceClientRect: props.clientRect as () => DOMRect,
              appendTo: () => document.body,
              content: component.element,
              showOnCreate: true,
              interactive: true,
              trigger: "manual",
              placement: "bottom-start",
            });
          },

          onUpdate: (props: SuggestionProps<MentionItem>) => {
            component?.updateProps({
              items: props.items,
              command: (item: MentionItem) => {
                props.command({
                  id: item.id,
                  label: item.name,
                  type: item.type,
                });
              },
            });

            if (!props.clientRect) {
              return;
            }

            popup?.[0]?.setProps({
              getReferenceClientRect: props.clientRect as () => DOMRect,
            });
          },

          onKeyDown: (props: SuggestionKeyDownProps) => {
            if (props.event.key === "Escape") {
              popup?.[0]?.hide();
              return true;
            }

            return component?.ref?.onKeyDown(props) ?? false;
          },

          onExit: () => {
            popup?.[0]?.destroy();
            component?.destroy();
          },
        };
      },
    },
  });
}
