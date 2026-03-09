import React from 'react';
import { Modal, Descriptions, Image, Tag, Row, Col, Card } from 'antd';
import { PET_STATUS_OPTIONS } from '../../../services/shelter/shelterPetsService';

const PetDetailModal = ({ visible, onCancel, pet }) => {
  if (!pet) return null;

  const getStatusDisplay = (status) => {
    const statusObj = PET_STATUS_OPTIONS.find(s => s.value === status);
    return statusObj || { label: status, color: 'default' };
  };

  const statusDisplay = getStatusDisplay(pet.status);

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 600 }}>
            {pet.petName}
          </span>
          <Tag color={statusDisplay.color}>{statusDisplay.label}</Tag>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
    >
      <Row gutter={[24, 24]}>
        {/* Image Section */}
        <Col span={24} md={10}>
          <Card
            cover={
              <Image
                src={pet.imageURL || 'https://via.placeholder.com/400x400?text=No+Image'}
                alt={pet.petName}
                style={{ 
                  width: '100%',
                  height: '300px',
                  objectFit: 'cover',
                  borderRadius: '8px'
                }}
                fallback="https://via.placeholder.com/400x400?text=No+Image"
              />
            }
            bordered={false}
          />
        </Col>

        {/* Details Section */}
        <Col span={24} md={14}>
          <Descriptions 
            column={1} 
            bordered
            size="middle"
            labelStyle={{ fontWeight: 500, width: '40%' }}
          >
            <Descriptions.Item label="ID">
              #{pet.petID}
            </Descriptions.Item>

            <Descriptions.Item label="Loại">
              <Tag color="purple">{pet.categoryName}</Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Giống">
              <Tag color="blue">{pet.breed}</Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Giới Tính">
              {pet.gender === 'Male' ? '♂️ Đực' : '♀️ Cái'}
            </Descriptions.Item>

            <Descriptions.Item label="Tuổi">
              {pet.age} tuổi
            </Descriptions.Item>

            {pet.weight && (
              <Descriptions.Item label="Cân Nặng">
                {pet.weight} kg
              </Descriptions.Item>
            )}

            {pet.color && (
              <Descriptions.Item label="Màu Sắc">
                {pet.color}
              </Descriptions.Item>
            )}

            <Descriptions.Item label="Sức Khỏe">
              <Tag color="green">{pet.healthStatus}</Tag>
            </Descriptions.Item>

            {pet.vaccinationStatus && (
              <Descriptions.Item label="Tiêm Chủng">
                {pet.vaccinationStatus}
              </Descriptions.Item>
            )}

            {pet.createdDate && (
              <Descriptions.Item label="Ngày Tạo">
                {new Date(pet.createdDate).toLocaleDateString('vi-VN')}
              </Descriptions.Item>
            )}
          </Descriptions>

          {pet.description && (
            <Card 
              title="Mô Tả Chi Tiết" 
              size="small" 
              style={{ marginTop: '1rem' }}
              headStyle={{ fontWeight: 600 }}
            >
              <p style={{ margin: 0, lineHeight: 1.6 }}>
                {pet.description}
              </p>
            </Card>
          )}
        </Col>
      </Row>
    </Modal>
  );
};

export default PetDetailModal;
