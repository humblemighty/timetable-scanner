{\rtf1\ansi\ansicpg1252\cocoartf2822
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 const \{ GoogleGenerativeAI \} = require("@google/generative-ai");\
\
exports.handler = async (event) => \{\
  // 1. Only allow POST requests (sending data)\
  if (event.httpMethod !== "POST") \{\
    return \{ statusCode: 405, body: "Method Not Allowed" \};\
  \}\
\
  try \{\
    // 2. Parse the incoming data\
    const body = JSON.parse(event.body);\
    const imageBase64 = body.image; // The image data\
\
    if (!imageBase64) \{\
      return \{ statusCode: 400, body: "No image provided" \};\
    \}\
\
    // 3. Initialize Google Gemini with your API Key\
    // (We will set this variable in the Netlify Dashboard later)\
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);\
    const model = genAI.getGenerativeModel(\{ model: "gemini-1.5-flash" \});\
\
    // 4. The Instruction for the AI\
    const prompt = `\
      Look at this timetable image. It has columns for dates/days and rows for times.\
      \
      Extract every class event into a valid JSON array.\
      \
      For each event object, extract these exact fields:\
      - "course_code": The code (e.g., "EEE F111", "CHEM F101", "BITS F102").\
      - "title": The name of the course (e.g., "ELECTRICAL SCIENCES", "FUNDA OF CHEM").\
      - "type": The type of session (Lecture, Tutorial, or Laboratory).\
      - "day": The day of the week (e.g., "Monday", "Tuesday"). If the header says "5 Jan", that is Monday. "6 Jan" is Tuesday, etc.\
      - "start_time": The start time in 24-hour format (e.g., "09:00", "13:00").\
      - "end_time": The end time in 24-hour format (e.g., "09:50", "14:50").\
      - "location": The room or building (e.g., "NEW ACADEMIC BUILDING 6153").\
      - "instructors": A string listing the instructors.\
\
      IMPORTANT: \
      - If a cell spans multiple rows (like a 2-hour lab), calculate the full duration (start of first slot to end of last slot).\
      - Return ONLY the JSON array. Do not include markdown formatting like \\`\\`\\`json.\
    `;\
\
    // 5. Send to Google\
    // We strip the header "data:image/jpeg;base64," if it exists to get just the raw data\
    const base64Data = imageBase64.replace(/^data:image\\/\\w+;base64,/, "");\
    \
    const result = await model.generateContent([\
      prompt,\
      \{\
        inlineData: \{\
          data: base64Data,\
          mimeType: "image/jpeg",\
        \},\
      \},\
    ]);\
\
    const response = await result.response;\
    const text = response.text();\
\
    // 6. Return the result to the frontend\
    return \{\
      statusCode: 200,\
      body: text,\
    \};\
\
  \} catch (error) \{\
    console.error("Error:", error);\
    return \{\
      statusCode: 500,\
      body: JSON.stringify(\{ error: "Failed to process image", details: error.message \}),\
    \};\
  \}\
\};}