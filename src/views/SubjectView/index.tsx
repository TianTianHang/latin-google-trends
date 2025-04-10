import { Tabs } from "antd";
import SubjectManagement from "./SubjectManagement";
import SubjectList from "./SubjectList";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useState } from "react";

const SubjectView=()=>{
    const {t}=useTranslation("views")
    const { tab } = useParams();
    const [activeKey,setActiveKey]=useState(tab)
    const items = [
        {
          key: '1',
          label: t("subject.tabs.list"),
          children:<SubjectList/>,
        },
        {
          key: '2',
          label: t("subject.tabs.management"),
          children: <SubjectManagement/>,
        },
      ];
    
      return (
        <div style={{ padding: 24 }}>
          <Tabs defaultActiveKey="1" items={items} activeKey={activeKey} onTabClick={(key)=>setActiveKey(key)}/>
        </div>
      );
}
export default SubjectView;