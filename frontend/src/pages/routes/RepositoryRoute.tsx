import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useUserData } from "../../hooks/useUserData";
import { Repository } from "../../components/droussi/Repository";
import { docToRepoFile } from "../../lib/droussiData";
import { getDocumentMetaOrDefault } from "../../lib/documentMeta";

export default function RepositoryRoute() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { docs, examCountByDoc } = useUserData();

  if (!user) return null;

  const uploadedFiles = docs.map((d) =>
    docToRepoFile(d, examCountByDoc.get(d.id) ?? 0, getDocumentMetaOrDefault(d.id))
  );

  return (
    <Repository
      uploadedFiles={uploadedFiles}
      onRegenerateExam={(fileId) => navigate(`/exam?doc=${fileId}`)}
      onNavigateToExam={() => navigate("/exam")}
    />
  );
}
