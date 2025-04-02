import { Tabs } from "antd";
import SubjectManagement from "./SubjectManagement";
import SubjectList from "./SubjectList";
import { useTranslation } from "react-i18next";

const SubjectView=()=>{
    const {t}=useTranslation("views")
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
          <Tabs defaultActiveKey="1" items={items} />
        </div>
      );
}
export default SubjectView;