"use client";
import { cn } from "@/lib/utils";
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { IconUpload } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";

const mainVariant = {
  initial: {
    x: 0,
    y: 0,
  },
  animate: {
    x: 10, // Reduced from 20
    y: -10, // Reduced from -20
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
}: {
  onChange?: (files: File[]) => void;
}) => {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (newFiles: File[]) => {
    const selectedFile = newFiles[0];
    setFile(selectedFile);
    onChange && onChange([selectedFile]);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const { getRootProps, isDragActive } = useDropzone({
    multiple: false,
    noClick: true,
    onDrop: (acceptedFiles) => handleFileChange(acceptedFiles),
    onDropRejected: (error) => {
      console.log(error);
    },
  });

  const removeFile = () => {
    setFile(null);
    onChange && onChange([]);
  };

  return (
    <div className="w-full" {...getRootProps()}>
      <motion.div
        onClick={handleClick}
        whileHover="animate"
        className="p-6 group/file block rounded-lg cursor-pointer w-full relative overflow-hidden" // Changed from p-10 to p-6
      >
        <input
          ref={fileInputRef}
          id="file-upload-handle"
          type="file"
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
          className="hidden"
          multiple={false}
        />
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
          <GridPattern />
        </div>
        <div className="flex flex-col items-center justify-center">
          <p className="relative z-20 font-sans font-bold text-neutral-700 dark:text-neutral-300 text-sm"> {/* Changed from text-base to text-sm */}
            Upload file
          </p>
          <p className="relative z-20 font-sans font-normal text-neutral-400 dark:text-neutral-400 text-xs mt-1"> {/* Changed from text-base to text-xs, mt-2 to mt-1 */}
            Drag or drop your file here or click to upload
          </p>
          <div className="relative w-full mt-6 max-w-md mx-auto"> {/* Changed from mt-10 to mt-6, max-w-xl to max-w-md */}
            {file ? (
              <motion.div
                layoutId="file-upload"
                className={cn(
                  "relative overflow-hidden z-40 bg-white dark:bg-neutral-900 flex flex-col items-start justify-start p-3 mt-3 w-full mx-auto rounded-md", // Changed from md:h-24 p-4 mt-4 to p-3 mt-3
                  "shadow-sm"
                )}
              >
                <div className="flex justify-between w-full items-center gap-2"> {/* Changed from gap-4 to gap-2 */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    layout
                    className="text-sm text-neutral-700 dark:text-neutral-300 truncate max-w-[180px]" // Changed from text-base to text-sm, max-w-xs to max-w-[180px]
                  >
                    {file.name}
                  </motion.p>
                  <div className="flex gap-1"> {/* Changed from gap-2 to gap-1 */}
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className="rounded px-1.5 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-white shadow-input" // Changed from px-2 py-1 to px-1.5 py-0.5, text-sm to text-xs
                    >
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </motion.p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile();
                      }}
                      className="rounded px-1.5 py-0.5 text-xs bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 shadow-input hover:bg-red-200 dark:hover:bg-red-800/50" // Changed from px-2 py-1 to px-1.5 py-0.5, text-sm to text-xs
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="flex text-xs md:flex-row flex-col items-start md:items-center w-full mt-1 justify-between text-neutral-600 dark:text-neutral-400"> {/* Changed from text-sm to text-xs, mt-2 to mt-1 */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    layout
                    className="px-1 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800"
                  >
                    {file.type}
                  </motion.p>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    layout
                  >
                    modified {new Date(file.lastModified).toLocaleDateString()}
                  </motion.p>
                </div>
              </motion.div>
            ) : (
              <>
                <motion.div
                  layoutId="file-upload"
                  variants={mainVariant}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  }}
                  className={cn(
                    "relative group-hover/file:shadow-xl z-40 bg-white dark:bg-neutral-900 flex items-center justify-center h-24 mt-3 w-full max-w-[6rem] mx-auto rounded-md", // Changed from h-32 to h-24, mt-4 to mt-3, max-w-[8rem] to max-w-[6rem]
                    "shadow-[0px_5px_30px_rgba(0,0,0,0.1)]" // Reduced shadow size
                  )}
                >
                  {isDragActive ? (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-neutral-600 flex flex-col items-center text-xs" // Added text-xs
                    >
                      Drop it
                      <IconUpload className="h-3 w-3 text-neutral-600 dark:text-neutral-400" /> {/* Changed from h-4 w-4 to h-3 w-3 */}
                    </motion.p>
                  ) : (
                    <IconUpload className="h-3 w-3 text-neutral-600 dark:text-neutral-300" />
                  )}
                </motion.div>
              </>
            )}

            <motion.div
              variants={secondaryVariant}
              className="absolute opacity-0 border border-dashed border-sky-400 inset-0 z-30 bg-transparent flex items-center justify-center h-24 mt-3 max-w-[8rem]  mx-auto rounded-md" // Changed h-32 to h-24, mt-4 to mt-3, max-w-[8rem] to max-w-[6rem]
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// GridPattern component remains the same
export function GridPattern() {
  const columns = 41;
  const rows = 11;
  return (
    <div className="flex bg-gray-100 dark:bg-neutral-900 shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px scale-105">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const index = row * columns + col;
          return (
            <div
              key={`${col}-${row}`}
              className={`w-10 h-10 flex shrink-0 rounded-[2px] ${index % 2 === 0
                  ? "bg-gray-50 dark:bg-neutral-950"
                  : "bg-gray-50 dark:bg-neutral-950 shadow-[0px_0px_1px_3px_rgba(255,255,255,1)_inset] dark:shadow-[0px_0px_1px_3px_rgba(0,0,0,1)_inset]"
                }`}
            />
          );
        })
      )}
    </div>
  );
}