import { WardView } from "@/components/citizen/views/ward-view";

// The same view with no data: the 3D block breathes in ghost mode until the
// real ward heights arrive.
export default function Loading() {
  return <WardView data={null} code="" />;
}
