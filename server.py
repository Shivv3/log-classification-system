from fastapi import FastAPI, Request, UploadFile, File, Form
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
import pandas as pd
import shutil
import os
from classify import classify_log

app = FastAPI()

# Mount static and templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

OUTPUT_PATH = "resources/output.csv"

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request, "results": None})

@app.post("/upload", response_class=HTMLResponse)
async def upload(request: Request, file: UploadFile = File(...)):

    # Save uploaded file temporarily
    temp_path = f"resources/temp_{file.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Read CSV
    df = pd.read_csv(temp_path)

    # Predict labels
    df["predicted_label"] = df.apply(lambda row: classify_log(row["source"], row["log_message"]), axis=1)

    # Save output
    df.to_csv(OUTPUT_PATH, index=False)

    # Prepare results for display
    results = df[["source", "log_message", "predicted_label"]].to_dict(orient="records")

    # --- Compute statistics ---
    total_logs = len(df)
    label_counts = df["predicted_label"].value_counts().to_dict()
    chart_labels = list(label_counts.keys())
    chart_values = list(label_counts.values())

    # Remove temp file
    os.remove(temp_path)
    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "results": results,
            "total_logs": total_logs,
            "label_counts": label_counts,
            "chart_labels": chart_labels,
            "chart_values": chart_values,
        }
    )

@app.get("/download")
async def download():
    return FileResponse(OUTPUT_PATH, filename="output.csv", media_type="text/csv")