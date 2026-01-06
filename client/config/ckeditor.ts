// config/ckeditor.ts
import {
  ClassicEditor,
  Bold,
  Italic,
  Essentials,
  Paragraph,
  Heading,
  Link,
  List,
  BlockQuote,
} from "ckeditor5";

export { ClassicEditor };

export const editorConfig = {
  licenseKey: "GPL",
  plugins: [
    Essentials,
    Bold,
    Italic,
    Paragraph,
    Heading,
    Link,
    List,
    BlockQuote,
  ],
  toolbar: [
    "heading",
    "|",
    "bold",
    "italic",
    "link",
    "|",
    "bulletedList",
    "numberedList",
    "blockQuote",
    "|",
    "undo",
    "redo",
  ],
};