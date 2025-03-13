import { RegisteredComponent } from "@/components/Editor/types";
import { Card} from "antd";

// 定义组件属性类型
interface ImageProps {
    src: string;
    alt: string;
    width: number;
    height: number;
  }
  // 定义组件
  const ImageComponent: React.ComponentType<ImageProps> = ({
    src,
    alt,
    width,
    height,
  }) => {
    return (
      <Card className="h-full">
        <img src={src} alt={alt} style={{ width, height }} />
      </Card>
    );
  };
  
  // 注册组件
  export const registeredImageComponent: RegisteredComponent<ImageProps> = {
    meta: {
      type: "image",
      name: "图片组件",
      icon: <span>🖼️</span>,
      defaultProps: {
        src: "https://via.placeholder.com/150",
        alt: "占位图片",
        width: 150,
        height: 100,
      },
      defaultLayout: {
        x: 0,
        y: 0,
        w: 1,
        h: 1,
      },
      propSchema: {
        src: {
          type: "text",
          label: "图片地址",
        },
        alt: {
          type: "text",
          label: "替代文字",
        },
        width: {
          type: "number",
          label: "宽度",
        },
        height: {
          type: "number",
          label: "高度",
        },
      },
    },
    component: ImageComponent,
  };
  