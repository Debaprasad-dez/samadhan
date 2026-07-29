// Re-mounts on every navigation within this group, replaying the page-enter
// transition while the persistent shell/nav stays put (native-app feel).
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
