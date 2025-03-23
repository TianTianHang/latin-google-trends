import { Result, Button, Layout, Typography } from 'antd';
import { Link } from 'react-router-dom'; // 如果使用其他路由库请替换

const { Content } = Layout;
const { Text } = Typography;

const NotFound = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: '#fff',
        }}
      >
        <Result
          status="404"
          title={
            <Text style={{ fontSize: 48, fontWeight: 600 }}>404</Text>
          }
          subTitle={
            <Text type="secondary" style={{ fontSize: 16 }}>
              抱歉，您访问的页面不存在
            </Text>
          }
          extra={
            <Link to="/">
              <Button type="primary" size="large" >
                返回首页
              </Button>
            </Link>
          }
          style={{
            padding: 0,
          }}
        />
      </Content>
    </Layout>
  );
};

export default NotFound;