import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { message } from "antd";
import { saveService } from "@/components/Editor/services/saveService";
import { useComponentRenderer } from "@/components/Editor/hooks/useComponentRenderer";

import { Layout, Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { ComponentData, PropsType } from "@/components/Editor/stores/componentsStore";

const ResponsiveGridLayout = WidthProvider(Responsive);
const responsiveMap = ["lg", "md", "sm", "xs", "xxs"];

const PreviewPage:React.FC = () => {
  const { id } = useParams();
  const { renderComponent } = useComponentRenderer();
  const [loading, setLoading] = useState(true);
  const [components, setComponents] = useState<ComponentData<PropsType>[]>([]);
  const [layouts, setLayouts] = useState<Record<string, Layout[]>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await saveService.loadFromLocalStorage(id);
        if (data) {
          const { components, layouts } = data;
          setComponents(components);
          
          const processedLayouts = layouts.filter((c: Layout) => c.i !== "");
          const responsiveLayouts = responsiveMap.reduce((acc, r) => {
            acc[r] = processedLayouts;
            return acc;
          }, {} as Record<string, Layout[]>);
          
          setLayouts(responsiveLayouts);
        } else {
          message.error("未找到指定的布局");
        }
      } catch (error) {
        console.error("加载布局失败:", error);
        message.error("加载布局失败");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);


  if (loading) {
    return <div>加载中...</div>;
  }

  return (
    <div className="h-screen">
      <ResponsiveGridLayout
        className="layout"
        style={{ height: "100%" }}
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        isDraggable={false}
        isResizable={false}
        useCSSTransforms
        autoSize
      >
        {components.map((comp) => (
          <div key={comp.id}>
            {renderComponent(comp)}
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
};
export default PreviewPage;