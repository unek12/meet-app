import React, {ChangeEvent, useId, useImperativeHandle, useRef, useState} from "react";
import './upload.css'
import {useAuth} from "../../hooks/useAuth";
export const Upload = () => {
  const [file, setFile] = useState<File>();
  const user = useAuth()

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      console.log(e.target.files[0])
      setFile(e.target.files[0]);
    }
  };

  const handleUploadClick = () => {
    if (!file) {
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    fetch(`${process.env.REACT_APP_API_URL}/upload`, {
      method: 'POST',
      body: formData,
    })
      .then()
      .catch((err) => console.error(err));
  };
  return (
    <div style={{
      display: "flex",
      alignItems: 'center',
      verticalAlign: 'center'
    }}>
      <img src={user?.avatar || 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/20625/avatar-bg.png'} alt="" style={{
        width: 50,
        height: 50,
        borderRadius: '50%',
        border: '1px solid black'
      }}/>
      <div className="input-file-row">
        <label className="input-file">
          <input type="file" onChange={handleFileChange} accept="image/*"/>
          <span>Выберите файл</span>
        </label>
      </div>
      {/*<div>{file && `${file.name} - ${file.type}`}</div>*/}

      {/*<button onClick={handleUploadClick}>Upload</button>*/}
    </div>
  );
}

