import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, DatePicker, InputNumber, Row, Col } from 'antd';
import { EVENT_TYPES } from '../../../services/shelter/shelterEventsService';
import { getShelterPets } from '../../../services/shelter/shelterPetsService';

const { TextArea } = Input;
const { Option } = Select;

const EventFormModal = ({ visible, onCancel, onSubmit, loading, shelterID }) => {
  const [form] = Form.useForm();
  const [pets, setPets] = useState([]);
  const [loadingPets, setLoadingPets] = useState(false);

  // Fetch pets để chọn liên kết
  useEffect(() => {
    const fetchPets = async () => {
      if (!shelterID) return;
      setLoadingPets(true);
      try {
        const result = await getShelterPets(shelterID, { pageSize: 100 });
        if (result.success) {
          setPets(result.data?.items || result.data || []);
        }
      } catch {
        // ignore
      } finally {
        setLoadingPets(false);
      }
    };

    if (visible) {
      fetchPets();
      form.resetFields();
    }
  }, [visible, shelterID, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const eventData = {
        eventName: values.eventName,
        eventDate: values.eventDate.toISOString(),
        eventType: values.eventType,
        petID: values.petID || null,
        description: values.description || '',
        location: values.location || '',
        reminderBefore: values.reminderBefore || null,
      };

      onSubmit(eventData);
    } catch {
      // validation failed
    }
  };

  return (
    <Modal
      title="Thêm Lịch Hẹn / Sự Kiện"
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      okText="Thêm Mới"
      cancelText="Hủy"
      confirmLoading={loading}
      width={700}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: '1.5rem' }}
      >
        <Row gutter={16}>
          <Col span={14}>
            <Form.Item
              name="eventName"
              label="Tên Sự Kiện"
              rules={[{ required: true, message: 'Vui lòng nhập tên sự kiện' }]}
            >
              <Input placeholder="Ví dụ: Khám sức khỏe định kỳ" size="large" />
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item
              name="eventType"
              label="Loại Sự Kiện"
              rules={[{ required: true, message: 'Vui lòng chọn loại' }]}
            >
              <Select placeholder="Chọn loại" size="large">
                {EVENT_TYPES.map(type => (
                  <Option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="eventDate"
              label="Ngày & Giờ"
              rules={[{ required: true, message: 'Vui lòng chọn ngày giờ' }]}
            >
              <DatePicker 
                showTime 
                format="DD/MM/YYYY HH:mm"
                placeholder="Chọn ngày giờ"
                size="large"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="petID"
              label="Thú Cưng Liên Quan"
            >
              <Select 
                placeholder="Chọn thú cưng (không bắt buộc)" 
                size="large"
                allowClear
                loading={loadingPets}
                showSearch
                optionFilterProp="children"
              >
                {pets.map(pet => (
                  <Option key={pet.petID} value={pet.petID}>
                    {pet.petName} {pet.breed ? `(${pet.breed})` : ''}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={16}>
            <Form.Item
              name="location"
              label="Địa Điểm"
            >
              <Input placeholder="Ví dụ: Phòng khám ABC" size="large" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="reminderBefore"
              label="Nhắc Trước (giờ)"
            >
              <InputNumber 
                min={1} 
                max={168}
                placeholder="24" 
                size="large"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="description"
          label="Mô Tả"
        >
          <TextArea 
            rows={3} 
            placeholder="Mô tả chi tiết về sự kiện..." 
            showCount 
            maxLength={500}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EventFormModal;
