import * as React from 'react'
import {Link, useNavigate} from 'react-router-dom'
import {useDispatch} from 'react-redux'
import {setCredentials} from './authSlice'
import {LockOutlined, UserOutlined} from '@ant-design/icons';
import {useLoginMutation} from '../../services/auth'
import {Button, Form, Input} from "antd";
import {toast} from "react-toastify";

export const Login = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [login, {isLoading}] = useLoginMutation()

  const onFinish = async (values: {
    username: string
    password: string
  }) => {
    console.log('Received values of form: ', values);
    try {
      const user = await login(values).unwrap()
      dispatch(setCredentials(user))
      navigate('/')
    } catch (err) {
      toast.error('somesing went wrong')
    }
  };

  return (
    <div style={{
      verticalAlign: 'center',
      height: '100vh',
      alignItems: 'center',
      display: 'flex'
    }}>
      <Form
        name="normal_login"
        className="login-form"
        initialValues={{remember: true}}
        onFinish={onFinish}
        style={{
          maxWidth: 400,
          margin: 'auto',
        }}
      >
        <Form.Item
          name="username"
          rules={[{required: true, message: 'Please input your Username!'}]}
        >
          <Input prefix={<UserOutlined className="site-form-item-icon"/>} placeholder="Username"/>
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{required: true, message: 'Please input your Password!'}]}
        >
          <Input
            prefix={<LockOutlined className="site-form-item-icon"/>}
            type="password"
            placeholder="Password"
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" className="login-form-button" disabled={isLoading}>
            Log in
          </Button> Or <Link to='/singup'>register now!</Link>
        </Form.Item>
      </Form>
    </div>
  );
}
