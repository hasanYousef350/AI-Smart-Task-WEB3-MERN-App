"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useDropzone } from "react-dropzone"
import { fileAPI } from "../../services/api"
import { Upload, File, Download, Trash2, Search } from "lucide-react"
import LoadingSpinner from "../../components/UI/LoadingSpinner"
import toast from "react-hot-toast"

const Files = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const queryClient = useQueryClient()

  const { data: files, isLoading } = useQuery({
    queryKey: ["files"],
    queryFn: fileAPI.getFiles,
  })

  const uploadFilesMutation = useMutation({
    mutationFn: fileAPI.uploadFiles,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["files"] })
      toast.success(`${response.data.files.length} file(s) uploaded successfully`)
      setIsUploading(false)
    },
    onError: () => {
      toast.error("Failed to upload files")
      setIsUploading(false)
    },
  })

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setIsUploading(true)
      const formData = new FormData()
      acceptedFiles.forEach((file) => {
        formData.append("files", file)
      })
      uploadFilesMutation.mutate(formData)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  })

  if (isLoading) {
    return <LoadingSpinner />
  }

  const fileData = files?.data || []

  // Filter files based on search term
  const filteredFiles = fileData.filter((file) => file.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (fileName) => {
    const extension = fileName.split(".").pop()?.toLowerCase()
    // You can expand this with more specific icons
    return <File className="h-8 w-8 text-gray-400" />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Files</h1>
          <p className="text-gray-600">Upload and manage your files</p>
        </div>
      </div>

      {/* Upload Area */}
      <div className="card">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          {isUploading ? (
            <div>
              <p className="text-lg font-medium text-gray-900 mb-2">Uploading...</p>
              <div className="w-32 h-2 bg-gray-200 rounded-full mx-auto">
                <div className="h-2 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          ) : isDragActive ? (
            <p className="text-lg font-medium text-blue-600">Drop the files here...</p>
          ) : (
            <div>
              <p className="text-lg font-medium text-gray-900 mb-2">Drag & drop files here, or click to select</p>
              <p className="text-gray-500">Support for multiple files</p>
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 input-field"
          />
        </div>
      </div>

      {/* Files Grid */}
      {filteredFiles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFiles.map((file) => (
            <div key={file._id} className="card hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-center mb-4">{getFileIcon(file.name)}</div>

              <div className="text-center mb-4">
                <h3 className="font-medium text-gray-900 truncate" title={file.name}>
                  {file.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{formatFileSize(file.size)}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(file.uploadedAt).toLocaleDateString()}</p>
              </div>

              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={() => {
                    // Handle download - you might need to implement this endpoint
                    window.open(`http://localhost:3000/files/${file._id}/download`, "_blank")
                  }}
                  className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    // Handle delete - you might need to implement this endpoint
                    if (window.confirm("Are you sure you want to delete this file?")) {
                      toast.error("Delete functionality not implemented yet")
                    }
                  }}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <File className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">
            {searchTerm ? "No files found matching your search" : "No files uploaded yet"}
          </p>
          {!searchTerm && <p className="text-gray-400">Upload your first file using the area above</p>}
        </div>
      )}
    </div>
  )
}

export default Files
