import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Upload,
  message,
  Divider,
} from "antd";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import { uploadMultipleImages } from "../../../services/uploadService";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const { Option } = Select;

const PostFormModal = ({ visible, onCancel, onSubmit, loading, initialData = null }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Check if this is edit mode
  const isEditMode = !!initialData;

  // Populate form when initialData changes
  useEffect(() => {
    if (visible && isEditMode && initialData) {
      form.setFieldsValue({
        title: initialData.title,
        content: initialData.content,
        postType: initialData.postType,
      });

      // Set existing images if available
      if (initialData.imageUrls || initialData.thumbnail) {
        try {
          let images = [];
          if (initialData.imageUrls && Array.isArray(initialData.imageUrls)) {
            images = initialData.imageUrls;
          } else if (initialData.thumbnail) {
            const parsed = JSON.parse(initialData.thumbnail);
            if (Array.isArray(parsed)) {
              images = parsed;
            }
          }

          if (images.length > 0) {
            const newFileList = images.map((url, index) => ({
              uid: -index - 1,
              name: `image-${index}`,
              status: 'done',
              url: url,
              thumbUrl: url,
            }));
            setFileList(newFileList);
          }
        } catch (e) {
          console.error("Error parsing images:", e);
        }
      }
    } else if (visible && !isEditMode) {
      form.resetFields();
      setFileList([]);
    }
  }, [visible, isEditMode, initialData, form]);

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      ["link", "image"],
      ["clean"],
    ],
  };

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Bạn chỉ có thể tải lên file hình ảnh!");
      return Upload.LIST_IGNORE;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error("Hình ảnh phải nhỏ hơn 5MB!");
      return Upload.LIST_IGNORE;
    }
    return false; // Prevent auto upload
  };

  const handleFinish = async (values) => {
    try {
      setUploading(true);
      let uploadedUrls = [];

      // Upload images first if any
      const filesToUpload = fileList
        .map((item) => item.originFileObj)
        .filter(Boolean);
      if (filesToUpload.length > 0) {
        const uploadResult = await uploadMultipleImages(filesToUpload);
        if (!uploadResult.success) {
          message.error(
            "Tải ảnh lên thất bại: " +
            (uploadResult.error || "Lỗi không xác định"),
          );
          setUploading(false);
          return;
        }
        uploadedUrls = uploadResult.imageUrls;
      }

      const postData = {
        title: values.title,
        content: values.content,
        postType: values.postType,
        imageUrls: uploadedUrls,
      };

      await onSubmit(postData);
      form.resetFields();
      setFileList([]);
    } catch (error) {
      console.error("Error submitting form:", error);
      message.error("Đã xảy ra lỗi khi tạo bài viết");
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    onCancel();
  };

  return (
    <Modal
      title={isEditMode ? "Chỉnh Sửa Bài Viết" : "Tạo Bài Viết Mới"}
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="back" onClick={handleCancel}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading || uploading}
          onClick={() => form.submit()}
        >
          {uploading ? "Đang Xử Lý..." : isEditMode ? "Cập nhật" : "Đăng Bài"}
        </Button>,
      ]}
      width={700}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ postType: "Story" }}
      >
        <Form.Item
          name="title"
          label="Tiêu đề"
          rules={[
            { required: true, message: "Vui lòng nhập tiêu đề!" },
            { max: 255, message: "Tiêu đề không được vượt quá 255 ký tự!" },
          ]}
        >
          <Input placeholder="Nhập tiêu đề bài viết (tối đa 255 ký tự)" />
        </Form.Item>

        <Form.Item
          name="postType"
          label="Loại Bài Viết"
          rules={[{ required: true, message: "Vui lòng chọn loại bài viết!" }]}
        >
          <Select placeholder="Chọn loại bài viết">
            <Option value="Story">Story / Câu Chuyện</Option>
            <Option value="News">News / Tin Tức</Option>
            <Option value="Event">Event / Sự Kiện</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="content"
          label="Nội dung bài viết"
          rules={[{ required: true, message: "Vui lòng nhập nội dung!" }]}
        >
          <ReactQuill
            theme="snow"
            modules={modules}
            style={{ height: "250px", marginBottom: "50px" }}
            placeholder="Nhập nội dung bài viết..."
          />
        </Form.Item>

        <Divider titlePlacement="left">Hình Ảnh Đính Kèm</Divider>
        <p style={{ color: "#8c8c8c", marginBottom: 16 }}>
          Bạn có thể chọn nhiều ảnh để gắn vào bài viết.
        </p>

        <Form.Item>
          <Upload
            listType="picture-card"
            fileList={fileList}
            onChange={handleUploadChange}
            beforeUpload={beforeUpload}
            multiple
          >
            {fileList.length >= 10 ? null : (
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Chọn Ảnh</div>
              </div>
            )}
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PostFormModal;
