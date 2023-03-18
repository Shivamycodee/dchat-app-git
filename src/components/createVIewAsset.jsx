import { useCreateAsset,useAsset,Player } from '@livepeer/react';
import { useCallback, useState,useMemo } from 'react';
import { useDropzone } from 'react-dropzone';

const myStyle = {
  width: "40%",
  padding:"5%",
  margin: "auto",
  marginTop: "5%",
  border: "2px dashed #ddd",
  textAlign:"center"
};
 
const CreateAndViewAsset = () => {
  const [video, setVideo] = useState(null);

  const {
    mutate: createAsset,
    data: asset,
    status,
    progress,
    error,
  } = useCreateAsset(video ? {sources: [{ name: video.name, file: video }]} : null,
  );
 
  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0 && acceptedFiles?.[0]) {
      setVideo(acceptedFiles[0]);
    }
}, []);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'video/*': ['*.mp4'],
    },
    maxFiles: 1,
    onDrop,
  });
 
  const progressFormatted = useMemo(
    () =>
      progress?.[0].phase === 'failed'
        ? 'Failed to process video.'
        : progress?.[0].phase === 'waiting'
        ? 'Waiting'
        : progress?.[0].phase === 'uploading'
        ? `Uploading: ${Math.round(progress?.[0]?.progress * 100)}%`
        : progress?.[0].phase === 'processing'
        ? `Processing: ${Math.round(progress?.[0].progress * 100)}%`
        : null,
    [progress],
  );

   const isLoading = useMemo(
     () =>
       status === "loading" ||
       (asset?.[0] && asset[0].status?.phase !== "ready"),
     [status, asset]
   );
    

    // const assetData = useAsset({assetId:"348eaae2-9aaf-45ea-8c20-a32f093c56eb"});

 

  return (
    <>
      <div style={myStyle}>
        <div className="livepeer-uploader" {...getRootProps()}>
          <input {...getInputProps()} />
          <p>Drag and drop or browse files</p>
        </div>

        {/* {createError?.message && <p>{createError.message}</p>} */}

        {video ? (
          <p>{video.name}</p>
        ) : (
          <p>
            <datagrid>slelect a video 🎥</datagrid>
          </p>
        )}
        {progressFormatted && <p>{progressFormatted}</p>}

        <button
          className="btn btn-outline-primary"
          style={{ width: "100%", marginTop: 20 }}
          onClick={() => {
            createAsset?.();
          }}
          disabled={isLoading}
        >
          Upload
        </button>
      </div>

      <div
        style={{
          width: "40%",
          padding: "2%",
          margin: "auto",
          border: "2px dashed #ddd",
          textAlign: "center",
        }}
      >
        <Player
          title="animated_video"
          playbackId="348ejilunispnxpq"
          showPipButton
          showTitle={false}
          aspectRatio="16to9"
          controls={{
            autohide: 3000,
          }}
          theme={{
            borderStyles: { containerBorderStyle: "hidden" },
            radii: { containerBorderRadius: "10px" },
          }}
        />
      </div>
    </>
  );
};

export default CreateAndViewAsset;