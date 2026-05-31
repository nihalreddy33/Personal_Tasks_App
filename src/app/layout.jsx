import "../index.css";
import "../App.css";

export const metadata = {
  title: "TaskFlow — Personal Task Dashboard",
  description: "A personal task tracker with kanban, analytics, and Postgres sync.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
