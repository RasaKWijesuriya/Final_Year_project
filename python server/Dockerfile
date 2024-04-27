FROM python:3.12.2-slim
WORKDIR /app
COPY . /app
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 3050
EXPOSE 4000
EXPOSE 4050

ENV FIREBASE_DATABASE_URL=https://vbkitsource-default-rtdb.firebaseio.com/
ENV SOURCE_SPREADSHEET=https://docs.google.com/spreadsheets/d/1T5tGvqs0etyn_4JwFVtCtUml9lw1QesDTvYumqidV9A/edit

CMD ["python", "./main.py"]
