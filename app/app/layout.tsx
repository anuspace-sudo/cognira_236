import Sidebar from "../../components/Sidebar";
import CogniraAssistant from "../../components/CogniraAssistant";
import WorkspaceHeader from "../../components/WorkspaceHeader";
import "./workspace.css";

export default function AppLayout({children}:{children:React.ReactNode}) {
  return <div className="app-shell"><Sidebar/><section className="app-main"><WorkspaceHeader />{children}</section><CogniraAssistant /></div>;
}
