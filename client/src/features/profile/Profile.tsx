import React, {ChangeEvent, useEffect, useState} from 'react';
import {useAuth} from "../../hooks/useAuth";
import {Button, Input, message, Modal, Upload} from "antd";
import {LoadingOutlined, PlusOutlined} from '@ant-design/icons';
import type {UploadChangeParam} from 'antd/es/upload';
import type {RcFile, UploadFile, UploadProps} from 'antd/es/upload/interface';
import {useUserUpdateMutation} from "../../services/user";
import {useNavigate} from "react-router-dom";

const getBase64 = (img: RcFile, callback: (url: string) => void) => {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result as string));
  reader.readAsDataURL(img);
};

const beforeUpload = (file: RcFile) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    message.error('You can only upload JPG/PNG file!');
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('Image must smaller than 2MB!');
  }
  return isJpgOrPng && isLt2M;
};

export const Profile = () => {
  const [modalIsOpen, setIsOpen] = React.useState(false);
  const user = useAuth()!
  const [imageUrl, setImageUrl] = useState<string>('https://s3-us-west-2.amazonaws.com/s.cdpn.io/20625/avatar-bg.png')
  const nav = useNavigate()
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    username: user.username,
    name: user.name,
    avatar: user.avatar
  })

  const [updateUser, {isLoading}] = useUserUpdateMutation()

  useEffect(() => {

  }, [imageUrl]);

  const handleChanges = (e: ChangeEvent<HTMLInputElement>) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value
    })
  }

  const handleChangeUpload: UploadProps['onChange'] = (info: UploadChangeParam<UploadFile>) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj as RcFile, (url) => {
        setLoading(false);
        setImageUrl(url);
      });
    }
  };

  function openModal() {
    setIsOpen(true);
  }

  function afterOpenModal() {
  }

  function closeModal() {
    setIsOpen(false);
  }

  return (
    <div style={{
      position: 'absolute',
      top: 10,
      right: 10
    }}>
      <Button type={'primary'} onClick={openModal}>Profile</Button>
      {
        user.isAdmin &&
        <Button
          style={{
            marginLeft: 10
          }}
          onClick={() => nav('/admin')}
        >
          Admin panel
        </Button>
      }
      <Modal
        open={modalIsOpen}
        // afterOpenChange={afterOpenModal}
        onOk={() => console.log('save')}
        onCancel={closeModal}
        style={{
          maxWidth: 850,
          maxHeight: 600,
          margin: "auto",
        }}
        title="Example Modal"
        footer={[
          <Button key="back" onClick={closeModal}>
            Отмена
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={isLoading}
            onClick={() => {
              updateUser(userData)
            }}
          >
            Сохранить
          </Button>
        ]}
      >
        {/*<h2 ref={(_subtitle) => (subtitle = _subtitle)}>Hello</h2>*/}
        <div style={{
          display: 'flex',
          flexWrap: 'nowrap',
          justifyContent: "space-around"
        }}>
          <div style={{
            margin: 'auto 0'
          }}>
            <div style={{
              margin: '13px 0'
            }}>
              <Input
                disabled={true}
                name='username'
                prefix='username:'
                value={userData.username}
              />
            </div>
            <div style={{
              margin: '13px 0'
            }}>
              <Input
                name='name'
                prefix='name:'
                value={userData.name}
                onChange={handleChanges}
              />
            </div>
          </div>
          <div style={{
            marginInlineEnd: 0,
            marginBottom: 0,
            width: 102,
            height: 102,
            borderRadius: 10,
            backgroundImage: `url(${userData?.avatar ? `${process.env.REACT_APP_API_URL}/static/images/${userData.avatar}` : 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/20625/avatar-bg.png'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}>
            <Upload
              name="file"
              listType="picture-card"
              className="avatar-uploader"
              style={{
                marginInlineEnd: 0,
                marginBottom: 0,
              }}
              customRequest={({data, file}) => {
                const formData = new FormData();
                formData.append('file', file);
                fetch(`${process.env.REACT_APP_API_URL}/upload`, {
                  method: 'POST',
                  body: formData,
                })
                  .then(res => res.json())
                  .then(res => {
                    console.log(res)
                    setUserData({
                      ...userData,
                      avatar: res.path
                    })
                  })
                  .catch((err) => console.error(err));
              }}
              action={`${process.env.REACT_APP_API_URL}/upload`}
              showUploadList={false}
              beforeUpload={beforeUpload}
              onChange={handleChangeUpload}
            >
              <div style={{
                marginInlineEnd: 0,
                marginBottom: 0
              }}>
                {<PlusOutlined/>}
                <div style={{marginTop: 8}}>Upload</div>
              </div>
            </Upload>
          </div>
        </div>
      </Modal>
    </div>
  );
};
