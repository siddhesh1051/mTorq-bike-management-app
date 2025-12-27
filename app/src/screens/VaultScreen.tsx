import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Upload,
  FileText,
  Trash2,
  Download,
  Eye,
  X,
  FolderOpen,
  Plus,
  File,
  Shield,
  FileCheck,
  Wrench,
  Award,
  MoreHorizontal,
  IdCard,
} from "lucide-react-native";
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";
import { WebView } from "react-native-webview";
import {
  useNavigation,
  useRoute,
  RouteProp,
  useFocusEffect,
} from "@react-navigation/native";
import { Bike, Document, DocumentType } from "../types";
import { LinearGradient } from "expo-linear-gradient";
import {
  Button,
  Input,
  ModalDialog,
  Picker,
  ConfirmDialog,
  Skeleton,
} from "../components";
import apiService from "../services/api";
import { useToast } from "../context/ToastContext";
import { format } from "date-fns";
import { CLOUDINARY_CONFIG } from "../config/api.config";

const { width, height } = Dimensions.get("window");

type VaultRouteParams = {
  Vault: {
    bike: Bike;
  };
};

// Document type icons and colors
const documentTypeConfig: Record<
  string,
  { icon: any; color: string; bgColor: string }
> = {
  "RC Certificate": { icon: FileText, color: "#3b82f6", bgColor: "#1e3a5f" },
  "Insurance Policy": { icon: Shield, color: "#22c55e", bgColor: "#14532d" },
  "PUC Certificate": { icon: FileCheck, color: "#84cc16", bgColor: "#365314" },
  "Driver's License": { icon: IdCard, color: "#ec4899", bgColor: "#5c1a3d" },
  "Service Records": { icon: Wrench, color: "#f97316", bgColor: "#4a2512" },
  "Warranty Documents": { icon: Award, color: "#8b5cf6", bgColor: "#3b2069" },
  Other: { icon: MoreHorizontal, color: "#fbbf24", bgColor: "#451a03" },
};

const DOCUMENT_TYPES = [
  "RC Certificate",
  "Insurance Policy",
  "PUC Certificate",
  "Driver's License",
  "Service Records",
  "Warranty Documents",
  "Other",
];

// Format file size
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

interface DocumentItemProps {
  document: Document;
  onView: () => void;
  onDownload: () => void;
  onDelete: () => void;
}

const DocumentItem: React.FC<DocumentItemProps> = ({
  document,
  onView,
  onDownload,
  onDelete,
}) => {
  const config =
    documentTypeConfig[document.document_type] || documentTypeConfig.Other;
  const IconComponent = config.icon;
  const displayName =
    document.document_type === "Other" && document.custom_name
      ? document.custom_name
      : document.document_type;

  return (
    <View style={styles.documentItem}>
      {/* Top Row - Icon and Info */}
      <View style={styles.documentTopRow}>
        <View
          style={[styles.documentIcon, { backgroundColor: config.bgColor }]}
        >
          <IconComponent color={config.color} size={28} />
        </View>
        <View style={styles.documentInfo}>
          <Text style={styles.documentName} numberOfLines={2}>
            {displayName}
          </Text>
          <Text style={styles.documentFileName} numberOfLines={1}>
            {document.file_name}
          </Text>
          <Text style={styles.documentMeta}>
            {formatFileSize(document.file_size)} •{" "}
            {format(new Date(document.created_at), "dd MMM yyyy")}
          </Text>
        </View>
      </View>

      {/* Bottom Row - Actions */}
      <View style={styles.documentActionsRow}>
        <TouchableOpacity style={styles.actionButtonLarge} onPress={onView}>
          <Eye color="#5eead4" size={16} />
          <Text style={styles.actionButtonText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButtonLarge, styles.actionButtonPrimary]}
          onPress={onDownload}
        >
          <Download color="#3b82f6" size={16} />
          <Text
            style={[styles.actionButtonText, { color: "#3b82f6" }]}
            numberOfLines={1}
          >
            Download
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButtonLarge, styles.actionButtonDanger]}
          onPress={onDelete}
        >
          <Trash2 color="#f87171" size={16} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Skeleton for loading state
const DocumentSkeleton = () => (
  <View style={styles.documentItem}>
    <View style={styles.documentTopRow}>
      <Skeleton width={56} height={56} borderRadius={14} />
      <View style={styles.documentInfo}>
        <Skeleton width={160} height={20} borderRadius={6} />
        <Skeleton
          width={120}
          height={14}
          borderRadius={4}
          style={{ marginTop: 6 }}
        />
        <Skeleton
          width={100}
          height={12}
          borderRadius={4}
          style={{ marginTop: 6 }}
        />
      </View>
    </View>
    <View style={styles.documentActionsRow}>
      <Skeleton style={{ flex: 1 }} height={40} borderRadius={10} />
      <Skeleton style={{ flex: 1 }} height={40} borderRadius={10} />
      <Skeleton style={{ flex: 1 }} height={40} borderRadius={10} />
    </View>
  </View>
);

export const VaultScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<VaultRouteParams, "Vault">>();
  const { bike } = route.params;
  const { showSuccess, showError } = useToast();

  // State
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Upload modal state
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState("");
  const [customName, setCustomName] = useState("");
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    uri: string;
    size: number;
  } | null>(null);

  // PDF Viewer state
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);

  // Delete confirmation state
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(
    null
  );

  // Downloading state
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchDocuments();
    }, [])
  );

  const fetchDocuments = async () => {
    try {
      const docs = await apiService.getDocumentsByBike(bike.id);
      setDocuments(docs);
    } catch (error) {
      console.error("Failed to load documents:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDocuments();
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];

        if (!file.uri) {
          showError("Error", "Failed to get file URI");
          return;
        }

        // Check file size (10MB limit)
        const fileSize = file.size || 0;
        if (fileSize > 10 * 1024 * 1024) {
          showError("File Too Large", "Please select a PDF file under 10MB");
          return;
        }

        setSelectedFile({
          name: file.name || "document.pdf",
          uri: file.uri,
          size: fileSize,
        });
      }
    } catch (error) {
      console.error("Error picking document:", error);
      showError("Error", "Failed to select document");
    }
  };

  const handleUpload = async () => {
    if (!selectedDocType) {
      showError("Missing Field", "Please select a document type");
      return;
    }

    if (selectedDocType === "Other" && !customName.trim()) {
      showError("Missing Field", "Please enter a name for the document");
      return;
    }

    if (!selectedFile) {
      showError("No File", "Please select a PDF file to upload");
      return;
    }

    // Check Cloudinary config
    if (!CLOUDINARY_CONFIG.CLOUD_NAME || !CLOUDINARY_CONFIG.UPLOAD_PRESET) {
      showError(
        "Config Error",
        "Cloudinary is not configured. Please check your .env file."
      );
      return;
    }

    setUploading(true);

    try {
      // Step 1: Upload to Cloudinary directly
      const formData = new FormData();

      // Fetch the file and create a blob
      const response = await fetch(selectedFile.uri);
      const blob = await response.blob();

      // Append file to form data
      formData.append("file", {
        uri: selectedFile.uri,
        type: "application/pdf",
        name: selectedFile.name,
      } as any);
      formData.append("upload_preset", CLOUDINARY_CONFIG.UPLOAD_PRESET);
      formData.append("folder", "mtorq_documents");

      // Upload to Cloudinary
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.CLOUD_NAME}/raw/upload`;

      const cloudinaryResponse = await fetch(cloudinaryUrl, {
        method: "POST",
        body: formData,
      });

      if (!cloudinaryResponse.ok) {
        const errorData = await cloudinaryResponse.json();
        throw new Error(
          errorData.error?.message || "Failed to upload to Cloudinary"
        );
      }

      const cloudinaryData = await cloudinaryResponse.json();

      // Step 2: Save document metadata to Firebase
      await apiService.uploadDocument({
        bike_id: bike.id,
        document_type: selectedDocType,
        file_url: cloudinaryData.secure_url,
        public_id: cloudinaryData.public_id,
        file_name: selectedFile.name,
        file_size: selectedFile.size,
        custom_name:
          selectedDocType === "Other" ? customName.trim() : undefined,
      });

      showSuccess("Uploaded", "Document uploaded successfully!");
      resetUploadForm();
      setUploadModalVisible(false);
      fetchDocuments();
    } catch (error: any) {
      console.error("Upload error:", error);
      const errorMessage =
        typeof error.response?.data?.detail === "string"
          ? error.response.data.detail
          : error.message || "Failed to upload document";
      showError("Upload Failed", errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const resetUploadForm = () => {
    setSelectedDocType("");
    setCustomName("");
    setSelectedFile(null);
  };

  const handleView = (document: Document) => {
    setViewingDocument(document);
    setViewerVisible(true);
  };

  const handleDownload = async (document: Document) => {
    setDownloadingId(document.id);

    try {
      const downloadUrl = await apiService.getDocumentDownloadUrl(document.id);

      // Open the URL - the browser/system will handle the download
      const canOpen = await Linking.canOpenURL(downloadUrl);
      if (canOpen) {
        await Linking.openURL(downloadUrl);
        showSuccess("Downloading", "Opening file for download...");
      } else {
        // Fallback: Try sharing the URL
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(document.file_url, {
            mimeType: "application/pdf",
            dialogTitle: `Download ${document.file_name}`,
          });
        } else {
          showError("Cannot Open", "Unable to open download link");
        }
      }
    } catch (error: any) {
      console.error("Download error:", error);
      showError("Download Failed", "Failed to download document");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDeletePress = (document: Document) => {
    setDocumentToDelete(document);
    setDeleteDialogVisible(true);
  };

  const confirmDelete = async () => {
    if (!documentToDelete) return;

    try {
      await apiService.deleteDocument(documentToDelete.id);
      showSuccess("Deleted", "Document deleted successfully");
      setDocuments((docs) => docs.filter((d) => d.id !== documentToDelete.id));
    } catch (error: any) {
      console.error("Delete error:", error);
      showError("Delete Failed", "Failed to delete document");
    } finally {
      setDeleteDialogVisible(false);
      setDocumentToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogVisible(false);
    setDocumentToDelete(null);
  };

  // Group documents by type
  const groupedDocuments = DOCUMENT_TYPES.reduce((acc, type) => {
    const docs = documents.filter((d) => d.document_type === type);
    if (docs.length > 0) {
      acc[type] = docs;
    }
    return acc;
  }, {} as Record<string, Document[]>);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft color="#ffffff" size={24} strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Document Vault</Text>
          <Text style={styles.headerSubtitle}>
            {bike.brand} {bike.model}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => setUploadModalVisible(true)}
        >
          <Plus color="#09090b" size={20} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#5eead4"
          />
        }
      >
        {/* Stats Banner */}
        <LinearGradient
          colors={["rgba(94, 234, 212, 0.15)", "rgba(94, 234, 212, 0.05)"]}
          style={styles.statsBanner}
        >
          <View style={styles.statsIcon}>
            <FolderOpen color="#5eead4" size={28} />
          </View>
          <View style={styles.statsInfo}>
            <Text style={styles.statsValue}>{documents.length}</Text>
            <Text style={styles.statsLabel}>Documents Stored</Text>
          </View>
        </LinearGradient>

        {/* Documents List */}
        {loading ? (
          <View style={styles.documentsList}>
            <DocumentSkeleton />
            <DocumentSkeleton />
            <DocumentSkeleton />
          </View>
        ) : documents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <File color="#3f3f46" size={64} />
            <Text style={styles.emptyTitle}>No documents yet</Text>
            <Text style={styles.emptySubtitle}>
              Upload your bike's important documents like RC, Insurance, PUC,
              etc.
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setUploadModalVisible(true)}
            >
              <Upload color="#09090b" size={18} />
              <Text style={styles.emptyButtonText}>Upload Document</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.documentsList}>
            {Object.entries(groupedDocuments).map(([type, docs]) => (
              <View key={type} style={styles.documentGroup}>
                <Text style={styles.groupTitle}>{type.toUpperCase()}</Text>
                {docs.map((doc) => (
                  <DocumentItem
                    key={doc.id}
                    document={doc}
                    onView={() => handleView(doc)}
                    onDownload={() => handleDownload(doc)}
                    onDelete={() => handleDeletePress(doc)}
                  />
                ))}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Upload Modal */}
      <ModalDialog
        visible={uploadModalVisible}
        onClose={() => {
          setUploadModalVisible(false);
          resetUploadForm();
        }}
        title="Upload Document"
        description="Add a PDF document to your vault"
        footer={
          <Button
            title={uploading ? "Uploading..." : "Upload"}
            onPress={handleUpload}
            disabled={uploading}
          />
        }
      >
        <Picker
          label="Document Type *"
          placeholder="Select document type"
          value={selectedDocType}
          options={DOCUMENT_TYPES.map((type) => ({
            label: type,
            value: type,
          }))}
          onValueChange={setSelectedDocType}
        />

        {selectedDocType === "Other" && (
          <Input
            label="Document Name *"
            placeholder="Enter document name"
            value={customName}
            onChangeText={setCustomName}
          />
        )}

        {/* File Picker Section */}
        <View style={styles.filePickerSection}>
          <Text style={styles.filePickerLabel}>PDF File *</Text>
          {selectedFile ? (
            <View style={styles.selectedFileContainer}>
              <View style={styles.selectedFileInfo}>
                <FileText color="#5eead4" size={24} />
                <View style={styles.selectedFileText}>
                  <Text style={styles.selectedFileName} numberOfLines={1}>
                    {selectedFile.name}
                  </Text>
                  <Text style={styles.selectedFileSize}>
                    {formatFileSize(selectedFile.size)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.removeFileButton}
                onPress={() => setSelectedFile(null)}
              >
                <X color="#f87171" size={18} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.filePickerButton}
              onPress={pickDocument}
            >
              <Upload color="#5eead4" size={24} />
              <Text style={styles.filePickerButtonText}>Select PDF File</Text>
              <Text style={styles.filePickerHint}>Max size: 10MB</Text>
            </TouchableOpacity>
          )}
        </View>
      </ModalDialog>

      {/* PDF Viewer Modal */}
      {viewerVisible && viewingDocument && (
        <SafeAreaView style={styles.viewerContainer}>
          <View style={styles.viewerHeader}>
            <TouchableOpacity
              style={styles.viewerCloseButton}
              onPress={() => {
                setViewerVisible(false);
                setViewingDocument(null);
              }}
            >
              <X color="#ffffff" size={24} />
            </TouchableOpacity>
            <Text style={styles.viewerTitle} numberOfLines={1}>
              {viewingDocument.document_type === "Other" &&
              viewingDocument.custom_name
                ? viewingDocument.custom_name
                : viewingDocument.document_type}
            </Text>
            <TouchableOpacity
              style={styles.viewerDownloadButton}
              onPress={() => handleDownload(viewingDocument)}
            >
              {downloadingId === viewingDocument.id ? (
                <ActivityIndicator color="#5eead4" size="small" />
              ) : (
                <Download color="#5eead4" size={20} />
              )}
            </TouchableOpacity>
          </View>
          <WebView
            source={{
              uri: `https://docs.google.com/viewer?url=${encodeURIComponent(
                viewingDocument.file_url
              )}&embedded=true`,
            }}
            style={styles.webView}
            startInLoadingState
            javaScriptEnabled={true}
            domStorageEnabled={true}
            renderLoading={() => (
              <View style={styles.webViewLoading}>
                <ActivityIndicator color="#5eead4" size="large" />
                <Text style={styles.webViewLoadingText}>Loading PDF...</Text>
              </View>
            )}
          />
        </SafeAreaView>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        visible={deleteDialogVisible}
        title="Delete Document"
        message={`Are you sure you want to delete "${
          documentToDelete?.document_type === "Other" &&
          documentToDelete?.custom_name
            ? documentToDelete.custom_name
            : documentToDelete?.document_type
        }"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090b",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#09090b",
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#71717a",
    marginTop: 2,
  },
  uploadButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#5eead4",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  statsBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(94, 234, 212, 0.2)",
  },
  statsIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(94, 234, 212, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  statsInfo: {
    marginLeft: 16,
  },
  statsValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
  },
  statsLabel: {
    fontSize: 14,
    color: "#71717a",
    marginTop: 2,
  },
  documentsList: {
    paddingHorizontal: 20,
  },
  documentGroup: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#71717a",
    letterSpacing: 1,
    marginBottom: 12,
  },
  documentItem: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  documentTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  documentIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  documentInfo: {
    flex: 1,
    marginLeft: 14,
  },
  documentName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    lineHeight: 22,
  },
  documentFileName: {
    fontSize: 13,
    color: "#a1a1aa",
    marginTop: 4,
  },
  documentMeta: {
    fontSize: 12,
    color: "#71717a",
    marginTop: 6,
  },
  documentActionsRow: {
    flexDirection: "row",
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
    gap: 10,
  },
  actionButtonLarge: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  actionButtonPrimary: {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
  },
  actionButtonDanger: {
    flex: 0,
    width: 44,
    paddingHorizontal: 0,
    backgroundColor: "rgba(248, 113, 113, 0.1)",
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#5eead4",
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.06)",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#ffffff",
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#71717a",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#5eead4",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#09090b",
  },
  filePickerSection: {
    marginBottom: 16,
  },
  filePickerLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#a1a1aa",
    marginBottom: 8,
  },
  filePickerButton: {
    alignItems: "center",
    backgroundColor: "rgba(94, 234, 212, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(94, 234, 212, 0.3)",
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 24,
    gap: 8,
  },
  filePickerButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#5eead4",
  },
  filePickerHint: {
    fontSize: 12,
    color: "#71717a",
  },
  selectedFileContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(94, 234, 212, 0.1)",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(94, 234, 212, 0.3)",
  },
  selectedFileInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  selectedFileText: {
    marginLeft: 12,
    flex: 1,
  },
  selectedFileName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#ffffff",
  },
  selectedFileSize: {
    fontSize: 12,
    color: "#71717a",
    marginTop: 2,
  },
  removeFileButton: {
    padding: 8,
  },
  viewerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#09090b",
    zIndex: 100,
  },
  viewerHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#18181b",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  viewerCloseButton: {
    padding: 8,
  },
  viewerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginHorizontal: 12,
  },
  viewerDownloadButton: {
    padding: 8,
  },
  webView: {
    flex: 1,
    backgroundColor: "#09090b",
  },
  webViewLoading: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#09090b",
  },
  webViewLoadingText: {
    fontSize: 14,
    color: "#71717a",
    marginTop: 12,
  },
});
