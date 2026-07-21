from supabase import create_client, Client
from dotenv import load_dotenv
import os

import pandas as pd
from prophet import Prophet
import matplotlib.pyplot as plt

load_dotenv()

supabase: Client = create_client(
      os.environ.get("VITE_SUPABASE_URL"),
      os.environ.get("VITE_SUPABASE_ANON_KEY")
)

dailyRevenue = supabase.table("v_revenue_daily").select("sale_date, revenue").execute()

data = []

if dailyRevenue.data:
      data = dailyRevenue.data
      

# Convert JSON to DataFrame
df = pd.DataFrame(data)

# Add year prefix (assuming 2026)
# df['ds'] = pd.to_datetime("2026-" + df['ds'], format="%Y-%m-%d")

df = df.rename(columns={"sale_date": "ds", "revenue": "y"})
df['ds'] = pd.to_datetime(df['ds'])  # ensure datetime type

# Fit Prophet model
model = Prophet()
model.fit(df)

# Make future predictions (next 14 days)
future = model.make_future_dataframe(periods=30)
forecast = model.predict(future)
# Plot forecast

model.plot(forecast)

# forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].to_json('forecast.json', orient='records')

# Merge actual sales with forecast
merged = pd.merge(
    forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']],
    df[['ds', 'y']],  # your actual sales
    on='ds',
    how='left'  # keep forecast dates, add y where available
)

# Save merged JSON
merged.to_json('forecast.json', orient='records', date_format='iso')


# plt.show()