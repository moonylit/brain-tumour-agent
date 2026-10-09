"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud, FileImage, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const mainVariant = {
  initial: {
    x: 0,
    y: 0,
  },
  animate: {
    x: 20,
    y: -20,
    opacity: 0.9,
  },
};

const secondaryVariant = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
};

export const FileUpload = ({
  onChange,
  className,
}: {
  onChange?: (files: File[]) => void;
  className?: string;
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (newFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    onChange && onChange(newFiles);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("w-full", className)}>
      <motion.div
        onClick={handleClick}
        whileHover="animate"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          if (e.dataTransfer.files) {
            handleFileChange(Array.from(e.dataTransfer.files));
          }
        }}
        className={cn(
          "p-8 sm:p-10 group/dropzone block rounded-2xl cursor-pointer w-full relative overflow-hidden transition-all duration-200 border-2 border-dashed bg-white/85 backdrop-blur-md shadow-lg shadow-slate-200/50",
          isDragOver
            ? "border-cyan-500 bg-cyan-50/70 scale-[0.99]"
            : "border-slate-300 hover:border-cyan-500 hover:bg-white"
        )}
      >
        <input
          ref={fileInputRef}
          id="file-upload-handle"
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files) {
              handleFileChange(Array.from(e.target.files));
            }
          }}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center text-center">
          <div className="relative w-16 h-16 mb-4">
            <motion.div
              variants={mainVariant}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
              className="absolute inset-0 flex items-center justify-center rounded-2xl bg-cyan-100/90 text-cyan-700 border border-cyan-200 shadow-md shadow-cyan-600/10"
            >
              <UploadCloud className="h-8 w-8" />
            </motion.div>
            <motion.div
              variants={secondaryVariant}
              className="absolute inset-0 flex items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md"
            >
              <FileImage className="h-7 w-7" />
            </motion.div>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Upload Patient MRI Scan
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xs">
            Drag &amp; drop Axial T1-Gd / T2 scan or click to browse local files
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-mono font-medium text-slate-700">
              <Sparkles className="h-3 w-3 text-cyan-600" />
              <span>ResNet-50 v2</span>
            </span>
            <span className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-mono font-medium text-slate-600">
              Grad-CAM Enabled
            </span>
            <span className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-mono font-medium text-slate-600">
              PNG / JPG / DICOM
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
