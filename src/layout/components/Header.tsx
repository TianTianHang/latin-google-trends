import React from "react";
import { Row, Col, Typography } from "antd";
import RightContent from "./RightContent";

const { Text } = Typography;

const HeaderComp: React.FC = () => {
  return (
    <>
    <Row justify="space-between" align="middle" gutter={[20,0]}>
      <Col >
        <Text strong  className="text-2xs" style={{ color: 'white' }}>
            Google Trends
        </Text>
      </Col>
      <Col style={{ display: "flex" }}>
        <RightContent />
      </Col>
    </Row>
   
    </>
  );
};

export default HeaderComp;