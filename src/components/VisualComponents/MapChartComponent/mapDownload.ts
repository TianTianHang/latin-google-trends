import html2canvas from "html2canvas";
import ReactECharts from "echarts-for-react";
import { RefObject } from "react";
import { message } from "antd";
export const downLoadTool = (echartsRef:RefObject<ReactECharts>,name:string) => ({
  // 自定义工具名称
  show: true,
  title: "保存为图片（含地图）",
  icon: "path://M432.45,595.444c0,22.036 17.963,39.999 39.999,39.999l342.729,0c22.036,0 39.999-17.963 39.999-39.999l0,-315.512c0,-22.036 -17.963,-39.999 -39.999,-39.999l-342.729,0c-22.036,0 -39.999,17.963 -39.999,39.999l0,315.512z",
  onclick: function () {
    const chartContainer = echartsRef.current; // 获取ECharts容器DOM元素
    if (chartContainer) {
      html2canvas(chartContainer.getEchartsInstance().getDom(), {
        useCORS: true, // 允许加载跨域的图片
        allowTaint: true,
      })
        .then((canvas) => {
          // 创建一个a标签用于触发下载
          const a = document.createElement("a");
          a.href = canvas.toDataURL("image/png");
          a.download = `${name}.png`; // 下载文件名
          a.click(); // 触发下载
        })
        .catch((error) => {
          message.error("截图失败:", error);
          console.error("截图失败:", error);
        });
    }
  },
});
