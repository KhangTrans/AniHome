import React, { useState, useEffect, useCallback } from 'react';
import { Card, Calendar, Badge, Row, Col, Timeline, Button, Space, Tag, Spin, Empty } from 'antd';
import { Clock, Plus, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getShelterEvents, createShelterEvent, EVENT_TYPES, getEventTypeInfo } from '../../services/shelter/shelterEventsService';
import EventFormModal from './components/EventFormModal';
import dayjs from 'dayjs';

const ScheduleManager = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [calendarValue, setCalendarValue] = useState(dayjs());

  const shelterID = user?.shelterID || 1;

  // Fetch events cho tháng đang xem
  const fetchEvents = useCallback(async (date) => {
    setLoading(true);
    try {
      const from = date.startOf('month').format('YYYY-MM-DD');
      const to = date.endOf('month').format('YYYY-MM-DD');

      const result = await getShelterEvents(shelterID, { from, to });
      if (result.success) {
        setEvents(Array.isArray(result.data) ? result.data : []);
      } else {
        toast.error(result.error || 'Không thể tải lịch hẹn');
      }
    } catch {
      toast.error('Đã xảy ra lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [shelterID, toast]);

  useEffect(() => {
    fetchEvents(calendarValue);
  }, [fetchEvents, calendarValue]);

  // Handle tạo event
  const handleCreateEvent = async (eventData) => {
    setFormLoading(true);
    try {
      const result = await createShelterEvent(shelterID, eventData);
      if (result.success) {
        toast.success(result.message);
        setFormVisible(false);
        fetchEvents(calendarValue);
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('Đã xảy ra lỗi khi tạo sự kiện');
    } finally {
      setFormLoading(false);
    }
  };

  // Calendar panel change (khi chuyển tháng)
  const handlePanelChange = (date) => {
    setCalendarValue(date);
  };

  // Render badge cho từng ngày trên calendar
  const dateCellRender = (value) => {
    const dateStr = value.format('YYYY-MM-DD');
    const dayEvents = events.filter(evt => {
      const evtDate = dayjs(evt.eventDate).format('YYYY-MM-DD');
      return evtDate === dateStr;
    });

    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {dayEvents.map((evt) => {
          const typeInfo = getEventTypeInfo(evt.eventType);
          return (
            <li key={evt.eventID}>
              <Badge
                status="default"
                color={typeInfo.color}
                text={
                  <span style={{
                    fontSize: '0.75rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: 'block',
                    maxWidth: '100%'
                  }}>
                    {evt.eventName}
                  </span>
                }
              />
            </li>
          );
        })}
      </ul>
    );
  };

  // Lọc sự kiện sắp tới (từ hôm nay trở đi)
  const upcomingEvents = events
    .filter(evt => dayjs(evt.eventDate).isAfter(dayjs().subtract(1, 'day')))
    .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));

  // Thống kê
  const thisWeekEnd = dayjs().endOf('week');
  const thisWeekEvents = events.filter(evt => {
    const d = dayjs(evt.eventDate);
    return d.isAfter(dayjs().startOf('week')) && d.isBefore(thisWeekEnd);
  });

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24
      }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>Lịch Hẹn</h1>
        <Button
          type="primary"
          icon={<Plus size={16} />}
          size="large"
          onClick={() => setFormVisible(true)}
        >
          Thêm Sự Kiện
        </Button>
      </div>

      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          {/* Upcoming Events Sidebar */}
          <Col xs={24} lg={8}>
            <Card
              title={
                <span style={{ fontSize: '1rem', fontWeight: 600 }}>
                  <Clock size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                  Sự Kiện Sắp Tới
                </span>
              }
              style={{ borderRadius: 8 }}
            >
              {upcomingEvents.length === 0 ? (
                <Empty description="Không có sự kiện sắp tới" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              ) : (
                <Timeline
                  items={upcomingEvents.slice(0, 8).map(evt => {
                    const typeInfo = getEventTypeInfo(evt.eventType);
                    return {
                      color: typeInfo.color,
                      children: (
                        <div>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: 4
                          }}>
                            <span style={{ fontWeight: 500 }}>{evt.eventName}</span>
                            <Tag color={typeInfo.color} style={{ marginLeft: 8, flexShrink: 0 }}>
                              {typeInfo.icon} {typeInfo.label}
                            </Tag>
                          </div>
                          {evt.petName && (
                            <div style={{ fontSize: '0.85rem', color: '#595959', marginBottom: 2 }}>
                              🐾 {evt.petName}
                            </div>
                          )}
                          {evt.description && (
                            <div style={{ fontSize: '0.82rem', color: '#8c8c8c', marginBottom: 2 }}>
                              {evt.description}
                            </div>
                          )}
                          <Space size="small" style={{ fontSize: '0.85rem', color: '#8c8c8c' }}>
                            <Clock size={14} />
                            <span>{dayjs(evt.eventDate).format('DD/MM/YYYY [lúc] HH:mm')}</span>
                          </Space>
                          {evt.status && (
                            <Tag 
                              color={evt.status === 'Scheduled' ? 'blue' : 'default'} 
                              style={{ marginLeft: 8, fontSize: '0.75rem' }}
                            >
                              {evt.status}
                            </Tag>
                          )}
                        </div>
                      )
                    };
                  })}
                />
              )}
            </Card>

            {/* Quick Stats */}
            <Card
              style={{ marginTop: 16, borderRadius: 8, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
              styles={{ body: { padding: '20px' } }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <div style={{ textAlign: 'center', color: 'white' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 600 }}>{events.length}</div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Tổng Sự Kiện</div>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ textAlign: 'center', color: 'white' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 600 }}>{thisWeekEvents.length}</div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Tuần Này</div>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Calendar View */}
          <Col xs={24} lg={16}>
            <Card
              style={{ borderRadius: 8 }}
              styles={{ body: { padding: '16px' } }}
            >
              <Calendar
                value={calendarValue}
                onPanelChange={handlePanelChange}
                onSelect={(date) => setCalendarValue(date)}
                cellRender={(current, info) => {
                  if (info.type === 'date') return dateCellRender(current);
                  return info.originNode;
                }}
                style={{ borderRadius: 8 }}
              />
            </Card>
          </Col>
        </Row>
      </Spin>

      {/* Form Modal */}
      <EventFormModal
        visible={formVisible}
        onCancel={() => setFormVisible(false)}
        onSubmit={handleCreateEvent}
        loading={formLoading}
        shelterID={shelterID}
      />
    </div>
  );
};

export default ScheduleManager;
