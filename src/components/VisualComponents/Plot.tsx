import Plotly from 'plotly.js';
import createPlotlyComponent from 'react-plotly.js/factory';
import { PlotParams } from 'react-plotly.js';
import { useEffect, useRef } from 'react';

// @ts-ignore
Plotly.setPlotConfig({ responsive: true });
export const PlotlyPlot = createPlotlyComponent(Plotly);

export const Plot = ({ ...props }: PlotParams) => {
  const elementRef = useRef(null);
  const plotRef = useRef<any>(null);

  useEffect(() => {
    if (!elementRef.current) {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      plotRef.current.resizeHandler();
    });

    resizeObserver.observe(elementRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div ref={elementRef} style={{ width: '100%', height: '100%' }}>
      <PlotlyPlot
        // @ts-ignore
        ref={plotRef}
        useResizeHandler
        {...props}
        layout={{
          autosize: true,
          ...props.layout,
        }}
        style={{
          width: '100%',
          height: '100%',
          ...props.style,
        }}
      />
    </div>
  );
};
