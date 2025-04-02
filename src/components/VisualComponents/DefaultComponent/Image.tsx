
import { RegisteredComponent } from "@/components/Editor/stores/registeredComponentsStore";
import { Card} from "antd";

// 定义组件属性类型
interface ImageProps {
    src: string;
    alt: string;
  }
  // 定义组件
  // eslint-disable-next-line react-refresh/only-export-components
  const ImageComponent: React.ComponentType<ImageProps> = ({
    src,
    alt
  }) => {
    return (
      <Card className="h-full w-full">
        <img src={src} alt={alt} />
      </Card>
    );
  };
  
  // 注册组件
  export const registeredImageComponent: RegisteredComponent<ImageProps> = {
    meta: {
      type: "image",
      name: "image",
      icon: <span>🖼️</span>,
      defaultProps: {
        src: "https://pic1.zhimg.com/v2-5ae520839cbca3eb8561a44abdac2a54_720w.jpg?source=172ae18b",
        alt: "占位图片",
      },
      propSchema: {
        src: {
          type: "text",
          label: "图片地址",
        },
        alt: {
          type: "text",
          label: "替代文字",
        }
      },
    },
    component: ImageComponent,
  };
  