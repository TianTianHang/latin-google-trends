import { WordCloud, WordCloudConfig } from "@ant-design/plots"

const TimeWordCloud=()=>{
    const config: WordCloudConfig = {
        paddingTop: 40,
        height: 300,
        data: {
          type: 'fetch',
          value: 'https://assets.antv.antgroup.com/g2/philosophy-word.json',
        },
        layout: { spiral: 'rectangular' },
        colorField: 'text',
        sizeField: 'value',
        theme: "classicDark"//or 'academy',
      };
    return(
        <>
         <WordCloud {...config} />;
        </>
    )
}
export default TimeWordCloud;