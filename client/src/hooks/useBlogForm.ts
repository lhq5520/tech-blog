import { useState } from "react"
import {type BlogFormData } from "../types";

const defaultFormData: BlogFormData = {
  title: "",
  subtitle: "",
  content: "",
};

export const useBlogForm = (initialData: BlogFormData = defaultFormData) => {
  const [formData, setFormData] = useState<BlogFormData>(initialData);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: value.trim()
        ? ""
        : prevErrors[name],
    }));
  };

  const validateForm = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required.";
    }
    if (!formData.subtitle.trim()) {
      newErrors.subtitle = "Subtitle is required.";
    }
    if (!formData.content?.trim()) {
      newErrors.content = "Content is required.";
    }
    return newErrors;
  };

  return { formData, setFormData, errors, setErrors, handleChange, validateForm }
}