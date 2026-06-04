import { useId, useState, useEffect } from "react";
import ReactQuill from "react-quill";
import styles from "./css/CustomEditor.module.css";
import "react-quill/dist/quill.snow.css";

const CustomEditor = ({ value, onChange, placeholder = "", label }) => {
  const [editorValue, setEditorValue] = useState(value || "");
  const uniqueId = useId();

  useEffect(() => {
    if ((value || "") !== editorValue) {
      setEditorValue(value || "");
    }
  }, [value, editorValue]);

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      ["blockquote", "code-block"],
      ["link"],
      ["clean"],
    ],
    clipboard: { matchVisual: false },
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "list",
    "bullet",
    "align",
    "blockquote",
    "code-block",
    "link",
  ];

  return (
    <div className={styles.editorWrapper}>
      {label && (
        <label htmlFor={uniqueId} className="form-label fw-bold">
          {label}
        </label>
      )}
      <ReactQuill
        id={uniqueId}
        value={editorValue}
        onChange={(val) => {
          setEditorValue(val);
          onChange?.(val);
        }}
        modules={modules}
        formats={formats}
        className="bigHoverInput rounded rounded-1"
        placeholder={placeholder}
        theme="snow"
      />
    </div>
  );
};

export default CustomEditor;
