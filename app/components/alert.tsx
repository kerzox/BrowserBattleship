import React, { useEffect, useState } from "react";
import Button from "./button";

const Alert = ({ alert }: { alert: any }) => {
  const [visible, setVisible] = useState(alert !== undefined);

  const display = () => {
    setVisible(!visible);
  };

  useEffect(() => {
    setVisible(alert !== undefined);
  }, [alert]);

  return visible ? (
    <div className={`alert alert-${alert.type}`} onClick={display}>
      <h1 style={{ padding: 0 }}>{alert.title}</h1>
      <span style={{ overflow: "auto" }}>{alert.body}</span>
      {alert.function != undefined ? (
        <div
          style={{
            display: "flex",
            gap: "6px",
            justifyContent: "space-evenly",
            marginTop: "auto",
          }}
        >
          <Button
            onClick={alert.function.accept}
            className="button-clean"
            style={{ flex: 1, width: "100%" }}
          >
            Accept
          </Button>{" "}
          <Button
            onClick={alert.function.deny}
            className="button-danger"
            style={{ flex: 1, width: "100%" }}
          >
            Deny
          </Button>
        </div>
      ) : (
        <></>
      )}
    </div>
  ) : (
    <></>
  );
};

export default Alert;
