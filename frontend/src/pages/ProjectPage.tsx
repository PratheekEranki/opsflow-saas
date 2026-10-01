import { Link, useParams } from 'react-router-dom'
import { Kanban } from 'lucide-react'

export default function ProjectPage() {
  const { projectId } = useParams()
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <Kanban className="w-12 h-12 text-gray-300" />
      <p className="text-gray-500">Project overview coming soon</p>
      <Link to={`/projects/${projectId}/board`} className="btn-primary">
        Open Kanban Board
      </Link>
    </div>
  )
}
