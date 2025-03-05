import { Tabs } from "antd";
import SubjectManagement from "./SubjectManagement";
import SubjectList from "./SubjectList";

const SubjectView=()=>{
    const items = [
        {
          key: '1',
          label: '主题列表',
          children:<SubjectList/>,
        },
        {
          key: '2',
          label: '主题管理',
          children: <SubjectManagement/>,
        },
      ];
    
      return (
        <div style={{ padding: 24 }}>
          <Tabs defaultActiveKey="1" items={items} />
        </div>
      );
}
export default SubjectView;