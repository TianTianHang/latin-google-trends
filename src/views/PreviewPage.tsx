import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { message, Spin } from "antd";
import { saveService } from "@/components/Editor/services/saveService";
import { useComponentRenderer } from "@/components/Editor/hooks/useComponentRenderer";

import { Layout, Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { useComponentsStore } from "@/components/Editor/stores/componentsStore";
import {
  useInterlinkedStore,
  useLayoutsStore,
} from "@/components/Editor/stores";
import { useUnmount } from "ahooks";

const ResponsiveGridLayout = WidthProvider(Responsive);
const responsiveMap = ["lg", "md", "sm", "xs", "xxs"];

const PreviewPage: React.FC = () => {
  const { t } = useTranslation("views");
  const { id } = useParams();
  const { renderComponent } = useComponentRenderer();
  const [loading, setLoading] = useState(true);
  // const [components, setComponents] = useState<ComponentData<PropsType>[]>([]);
  const { components } = useComponentsStore();
  const [layouts, setLayouts] = useState<Record<string, Layout[]>>({});
  const reset = () => {
    useComponentsStore.getState().reset();
    useInterlinkedStore.getState().reset();
    useLayoutsStore.getState().reset();
  };

  useUnmount(() => {
    reset();
  });
  useEffect(() => {
    reset();
    if (!id) {
      return;
    }
    const loadData = async () => {
      try {
        const data = await saveService.load(id);
        if (data) {
          const { components, layouts, interlinks } = data;
          //setComponents(components)
          useComponentsStore.setState({ components });
          useInterlinkedStore.setState({ interlinked: interlinks });
          const processedLayouts = layouts.filter((c: Layout) => c.i !== "");
          const responsiveLayouts = responsiveMap.reduce((acc, r) => {
            acc[r] = processedLayouts;
            return acc;
          }, {} as Record<string, Layout[]>);

          setLayouts(responsiveLayouts);
        } else {
          message.error(t("preview.message.layoutNotFound"));
        }
      } catch (error) {
        console.error("加载布局失败:", error);
        message.error(t("preview.message.loadLayoutFailed"));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, t]);

  if (loading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <Spin size="large" tip={t("preview.status.loading")}/>
        </div>
      );
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
          <div key={comp.id}>{renderComponent(comp,true)}</div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
};
export default PreviewPage;
