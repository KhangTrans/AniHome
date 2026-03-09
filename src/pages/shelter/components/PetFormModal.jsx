import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, Row, Col } from 'antd';
import { validatePetData, PET_GENDER_OPTIONS } from '../../../services/shelter/shelterPetsService';
import { getAllCategories } from '../../../services/admin/adminCategoriesService';

const { TextArea } = Input;
const { Option } = Select;

const PetFormModal = ({ visible, onCancel, onSubmit, loading, initialData = null }) => {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const result = await getAllCategories();
        if (result.success) {
          // Filter only Pet categories
          const petCategories = result.data.filter(cat => cat.categoryType === 'Pet');
          setCategories(petCategories);
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    if (visible) {
      fetchCategories();
    }
  }, [visible]);

  // Set initial form values
  useEffect(() => {
    if (visible && initialData) {
      form.setFieldsValue({
        petName: initialData.petName,
        categoryID: initialData.categoryID,
        breed: initialData.breed,
        age: initialData.age,
        gender: initialData.gender,
        color: initialData.color,
        weight: initialData.weight,
        healthStatus: initialData.healthStatus,
        vaccinationStatus: initialData.vaccinationStatus,
        description: initialData.description,
        imageURL: initialData.imageURL,
      });
    } else if (visible) {
      form.resetFields();
    }
  }, [visible, initialData, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Validate with service
      const validation = validatePetData(values);
      if (!validation.isValid) {
        // Show validation errors
        form.setFields(
          Object.entries(validation.errors).map(([name, error]) => ({
            name,
            errors: [error],
          }))
        );
        return;
      }

      onSubmit(values);
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  return (
    <Modal
      title={initialData ? 'Cập Nhật Thông Tin Thú Cưng' : 'Thêm Thú Cưng Mới'}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      okText={initialData ? 'Cập Nhật' : 'Thêm Mới'}
      cancelText="Hủy"
      confirmLoading={loading}
      width={800}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: '1.5rem' }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="petName"
              label="Tên Thú Cưng"
              rules={[{ required: true, message: 'Vui lòng nhập tên thú cưng' }]}
            >
              <Input placeholder="Ví dụ: Bông" size="large" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="categoryID"
              label="Loại Thú Cưng"
              rules={[{ required: true, message: 'Vui lòng chọn loại thú cưng' }]}
            >
              <Select 
                placeholder="Chọn loại" 
                size="large"
                loading={loadingCategories}
              >
                {categories.map(cat => (
                  <Option key={cat.categoryID} value={cat.categoryID}>
                    {cat.categoryName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="breed"
              label="Giống"
              rules={[{ required: true, message: 'Vui lòng nhập giống' }]}
            >
              <Input placeholder="Ví dụ: Corgi" size="large" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="gender"
              label="Giới Tính"
              rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
            >
              <Select placeholder="Chọn giới tính" size="large">
                {PET_GENDER_OPTIONS.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="age"
              label="Tuổi"
              rules={[{ required: true, message: 'Vui lòng nhập tuổi' }]}
            >
              <InputNumber 
                placeholder="Tuổi" 
                size="large" 
                min={0} 
                max={300}
                style={{ width: '100%' }}
                addonAfter="tuổi"
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="weight"
              label="Cân Nặng"
            >
              <InputNumber 
                placeholder="Cân nặng" 
                size="large" 
                min={0} 
                max={200}
                step={0.1}
                style={{ width: '100%' }}
                addonAfter="kg"
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="color"
              label="Màu Sắc"
            >
              <Input placeholder="Ví dụ: Vàng" size="large" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="healthStatus"
          label="Tình Trạng Sức Khỏe"
          rules={[{ required: true, message: 'Vui lòng nhập tình trạng sức khỏe' }]}
        >
          <Input placeholder="Ví dụ: Khỏe mạnh" size="large" />
        </Form.Item>

        <Form.Item
          name="vaccinationStatus"
          label="Tình Trạng Tiêm Chủng"
        >
          <Input placeholder="Ví dụ: Đã tiêm đủ 5 mũi" size="large" />
        </Form.Item>

        <Form.Item
          name="imageURL"
          label="URL Hình Ảnh"
        >
          <Input placeholder="https://example.com/image.jpg" size="large" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô Tả"
        >
          <TextArea 
            rows={4} 
            placeholder="Mô tả chi tiết về thú cưng..."
            size="large"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PetFormModal;
