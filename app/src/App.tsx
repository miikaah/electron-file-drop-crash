import React from "react";
import * as Api from "./apiClient.electron";

const App = () => {
  const onDragOver = (event: React.DragEvent<HTMLDivElement>) =>
    event.preventDefault();

  const onDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!event.dataTransfer) {
      return;
    }

    if (event.dataTransfer.files.length > 0) {
      const files = await Api.crashTheApp(event.dataTransfer.files);
      console.log("files", files);
      return;
    }
  };

  return (
    <div className="main" onDragOver={onDragOver} onDrop={onDrop}>
      Drop a file from file explorer here
    </div>
  );
};

export default App;
