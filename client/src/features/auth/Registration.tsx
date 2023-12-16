import * as React from 'react'
import {Link, useNavigate} from 'react-router-dom'
import {useDispatch} from 'react-redux'
import {setCredentials} from './authSlice'

import {LoginRequest, useRegistrationMutation} from '../../services/auth'
import {Button, Form, Input} from "antd";
import {LockOutlined, UserOutlined} from "@ant-design/icons";
import {toast} from "react-toastify";

export const Registration = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  // const toast = useToast()
  const [registration, {isLoading}] = useRegistrationMutation()

  const [formState, setFormState] = React.useState<LoginRequest>({
    username: '',
    password: '',
  })

  const handleChange = ({
                          target: {name, value},
                        }: React.ChangeEvent<HTMLInputElement>) =>
    setFormState((prev) => ({...prev, [name]: value}))
  const onFinish = async (values: {
    username: string
    password: string
  }) => {
    console.log('Received values of form: ', values);
    try {
      const user = await registration(values).unwrap()
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
            Register
          </Button> Or <Link to='/login'>login now!</Link>
        </Form.Item>
      </Form>
    </div>
  )
}
