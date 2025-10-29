# app/api/v1/endpoints/analysis.py
from fastapi import APIRouter, Depends, UploadFile, Form, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
import pandas as pd
import numpy as np
from app.db.session import get_db
from app.utils.file import save_file
from app.services.user import UserServices
from app.schemas.anlysis import AnalysisRequirements, AnalysisRequirementIn, AnalysisTransactionOut
from app.models.user import User
from app.models.analysis import Analysis_Requirement, Analysis_Result
from app.services.analysis import AnalysisService
from app.services.transaction import TransactionService
from fastapi.responses import JSONResponse
import subprocess, json, tempfile
import os

router = APIRouter(prefix="/analysis", tags=["analysis"])


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

current_dir = os.path.dirname(os.path.abspath(__file__))         # backend/app/routes
backend_dir = os.path.dirname(os.path.dirname(current_dir))  

@router.post("/analyze", response_model=AnalysisTransactionOut, status_code=201)
async def return_analysis_dashboard(
    token: str = Depends(oauth2_scheme),
    requirements: str = Form(...),
    file: UploadFile = None,
    db: AsyncSession = Depends(get_db)
):
    print("Received analysis request")
    user_services = UserServices(db)
    current_user = await user_services.get_current_user(token)
    if not current_user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    # Save file
    try:
        file_path = save_file(file, str(current_user.id))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"File error: {str(e)}")

    print("File saved at:", file_path)
    # Store in DB
    transaction_service = TransactionService(db)
    transaction = await transaction_service.create_transaction(
        user_id=current_user.id,
        file_name=file.filename,
        file_path=file_path,
        user_query=requirements,
    )

    """
    Upload dataset + requirements.
    Performs basic EDA and stores transaction.
    """

    print("Transaction created with ID:", transaction.id)
    # try:
    analysis_service = AnalysisService(db)
    analysis_result = await analysis_service.perform_analysis(requirement_id=transaction.id)
    # except Exception as e:
    #     raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")

    await db.refresh(analysis_result)
    await db.refresh(transaction)
    return AnalysisTransactionOut(
        user_id=transaction.user_id,
        transaction_id=transaction.id,
        dataset_name=transaction.file_name,
        requirements=transaction.user_query,
        dashboard_code=analysis_result.dashboard_code
    )


@router.post("/dashboard", status_code=200, response_model=AnalysisTransactionOut)
async def get_dashboard_code(
    token: str = Depends(oauth2_scheme),
    requirements: str = Form(...),
    file: UploadFile = None,
    db: AsyncSession = Depends(get_db)
):
    print("Received analysis request")
    user_services = UserServices(db)
    current_user = await user_services.get_current_user(token)
    if not current_user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    # Save file
    try:
        file_path = save_file(file, str(current_user.id))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"File error: {str(e)}")

    print("File saved at:", file_path)
    # Store in DB
    transaction_service = TransactionService(db)
    transaction = await transaction_service.create_transaction(
        user_id=current_user.id,
        file_name=file.filename,
        file_path=file_path,
        user_query=requirements,
    )

    """
    Upload dataset + requirements.
    Performs basic EDA and stores transaction.
    """

    print("Transaction created with ID:", transaction.id)
    # try:
    analysis_service = AnalysisService(db)
    # analysis_result = await analysis_service.generate_dashboard_code(requirement_id=transaction.id)
    analysis_result = "import React, { useState, useEffect, useMemo } from \"react\";\nimport {\n  ResponsiveContainer,\n  BarChart,\n  Bar,\n  LineChart,\n  Line,\n  AreaChart,\n  Area,\n  PieChart,\n  Pie,\n  ScatterChart,\n  Scatter,\n  ComposedChart,\n  XAxis,\n  YAxis,\n  CartesianGrid,\n  Tooltip,\n  Legend,\n  Cell,\n} from \"recharts\";\n\nconst DashboardComponent = () => {\n  const [data, setData] = useState([]);\n  const [loading, setLoading] = useState(true);\n  const [error, setError] = useState(null);\n  const [retryCount, setRetryCount] = useState(0);\n\n  useEffect(() => {\n    let isMounted = true;\n    const fetchData = async () => {\n      try {\n        setLoading(true);\n        setError(null);\n        const response = await fetch('http://127.0.0.1:8000/api/analysis/dataset/35');\n        if (!response.ok) {\n          throw new Error(`HTTP error! status: ${response.status}`);\n        }\n        const result = await response.json();\n        if (isMounted) {\n          setData(Array.isArray(result) ? result : []);\n          setLoading(false);\n        }\n      } catch (err) {\n        if (isMounted) {\n          setError(err.message);\n          setLoading(false);\n        }\n      }\n    };\n\n    fetchData();\n\n    return () => {\n      isMounted = false;\n    };\n  }, [retryCount]);\n\n  const processedData = useMemo(() => {\n    if (!data || data.length === 0) {\n      return {\n        totalSales: 0,\n        totalProfit: 0,\n        averageDiscount: 0,\n        profitMargin: 0,\n        salesByRegion: [],\n        profitByProduct: [],\n        salesOverTime: [],\n        profitVsDiscount: [],\n        salesProfitByRegion: [],\n        productQuantityDistribution: [],\n      };\n    }\n\n    try {\n      let totalSales = 0;\n      let totalProfit = 0;\n      let totalDiscount = 0;\n      let validDiscountCount = 0;\n\n      const salesByRegionMap = new Map();\n      const profitByProductMap = new Map();\n      const salesOverTimeMap = new Map();\n      const profitVsDiscountData = [];\n      const salesProfitByRegionMap = new Map();\n      const productQuantityDistributionMap = new Map();\n\n      data.forEach(item => {\n        const sales = typeof item.Sales === 'number' ? item.Sales : 0;\n        const profit = typeof item.Profit === 'number' ? item.Profit : 0;\n        const discount = typeof item.Discount === 'number' ? item.Discount : 0;\n        const quantity = typeof item.Quantity === 'number' ? item.Quantity : 0;\n        const region = typeof item.Region === 'string' ? item.Region : 'Unknown';\n        const product = typeof item.Product === 'string' ? item.Product : 'Unknown';\n        const date = typeof item.Date === 'string' ? new Date(item.Date) : null;\n\n        totalSales += sales;\n        totalProfit += profit;\n        if (discount !== null && discount !== undefined) {\n          totalDiscount += discount;\n          validDiscountCount++;\n        }\n\n        salesByRegionMap.set(region, (salesByRegionMap.get(region) || 0) + sales);\n        profitByProductMap.set(product, (profitByProductMap.get(product) || 0) + profit);\n\n        if (date && !isNaN(date)) {\n          const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;\n          salesOverTimeMap.set(monthYear, (salesOverTimeMap.get(monthYear) || 0) + sales);\n        }\n\n        profitVsDiscountData.push({ discount: discount, profit: profit });\n\n        const currentRegionData = salesProfitByRegionMap.get(region) || { sales: 0, profit: 0 };\n        currentRegionData.sales += sales;\n        currentRegionData.profit += profit;\n        salesProfitByRegionMap.set(region, currentRegionData);\n\n        productQuantityDistributionMap.set(product, (productQuantityDistributionMap.get(product) || 0) + quantity);\n      });\n\n      const averageDiscount = validDiscountCount > 0 ? totalDiscount / validDiscountCount : 0;\n      const profitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;\n\n      const salesByRegion = Array.from(salesByRegionMap, ([region, sales]) => ({ region, sales }));\n      const profitByProduct = Array.from(profitByProductMap, ([product, profit]) => ({ product, profit }));\n      const salesOverTime = Array.from(salesOverTimeMap, ([monthYear, sales]) => ({ monthYear, sales }))\n        .sort((a, b) => a.monthYear.localeCompare(b.monthYear));\n      const salesProfitByRegion = Array.from(salesProfitByRegionMap, ([region, values]) => ({ region, sales: values.sales, profit: values.profit }));\n      const productQuantityDistribution = Array.from(productQuantityDistributionMap, ([product, quantity]) => ({ product, quantity }));\n\n      return {\n        totalSales,\n        totalProfit,\n        averageDiscount,\n        profitMargin,\n        salesByRegion,\n        profitByProduct,\n        salesOverTime,\n        profitVsDiscount: profitVsDiscountData,\n        salesProfitByRegion,\n        productQuantityDistribution,\n      };\n    } catch (e) {\n      console.error(\"Error processing data:\", e);\n      setError(\"Error processing data for charts.\");\n      return {\n        totalSales: 0,\n        totalProfit: 0,\n        averageDiscount: 0,\n        profitMargin: 0,\n        salesByRegion: [],\n        profitByProduct: [],\n        salesOverTime: [],\n        profitVsDiscount: [],\n        salesProfitByRegion: [],\n        productQuantityDistribution: [],\n      };\n    }\n  }, [data]);\n\n  if (loading) {\n    return (\n      <div className=\"flex items-center justify-center min-h-screen bg-gray-100\">\n        <div className=\"flex flex-col items-center p-6 bg-white rounded-lg shadow-lg\">\n          <div className=\"animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500\"></div>\n          <p className=\"mt-4 text-lg text-gray-700\">Loading dashboard data...</p>\n        </div>\n      </div>\n    );\n  }\n\n  if (error) {\n    return (\n      <div className=\"flex items-center justify-center min-h-screen bg-gray-100\">\n        <div className=\"flex flex-col items-center p-6 bg-white rounded-lg shadow-lg text-red-600\">\n          <p className=\"text-xl font-bold mb-4\">Error: {error}</p>\n          <p className=\"text-gray-700 mb-4\">Failed to load data. Please try again.</p>\n          <button\n            onClick={() => setRetryCount(prev => prev + 1)}\n            className=\"px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors\"\n          >\n            Retry\n          </button>\n        </div>\n      </div>\n    );\n  }\n\n  const {\n    totalSales,\n    totalProfit,\n    averageDiscount,\n    profitMargin,\n    salesByRegion,\n    profitByProduct,\n    salesOverTime,\n    profitVsDiscount,\n    salesProfitByRegion,\n    productQuantityDistribution,\n  } = processedData;\n\n  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];\n\n  return (\n    <div className=\"min-h-screen bg-gray-100 p-6\">\n      <h1 className=\"text-3xl font-bold text-gray-800 mb-6 text-center\">Sales Performance Dashboard</h1>\n\n      <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8\">\n        <div className=\"bg-white p-6 rounded-lg shadow-md flex items-center justify-between\">\n          <div>\n            <p className=\"text-lg font-semibold text-gray-600\">Total Sales</p>\n            <p className=\"text-3xl font-bold text-blue-600 mt-1\">${totalSales.toLocaleString()}</p>\n          </div>\n          <svg xmlns=\"http://www.w3.org/2000/svg\" className=\"h-10 w-10 text-blue-400\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\">\n            <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth=\"2\" d=\"M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V3m0 9v3m0-9c-1.11 0-2.08-.402-2.599-1M12 12c-1.11 0-2.08.402-2.599 1M12 12V9m0 3v3m0 0h.01M12 12h.01\" />\n          </svg>\n        </div>\n\n        <div className=\"bg-white p-6 rounded-lg shadow-md flex items-center justify-between\">\n          <div>\n            <p className=\"text-lg font-semibold text-gray-600\">Total Profit</p>\n            <p className={`text-3xl font-bold mt-1 ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>${totalProfit.toLocaleString()}</p>\n          </div>\n          <svg xmlns=\"http://www.w3.org/2000/svg\" className={`h-10 w-10 ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`} fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\">\n            <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth=\"2\" d=\"M13 7h8m0 0v8m0-8l-8 8-4-4-6 6\" />\n          </svg>\n        </div>\n\n        <div className=\"bg-white p-6 rounded-lg shadow-md flex items-center justify-between\">\n          <div>\n            <p className=\"text-lg font-semibold text-gray-600\">Avg. Discount</p>\n            <p className=\"text-3xl font-bold text-purple-600 mt-1\">{averageDiscount.toFixed(2)}%</p>\n          </div>\n          <svg xmlns=\"http://www.w3.org/2000/svg\" className=\"h-10 w-10 text-purple-400\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\">\n            <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth=\"2\" d=\"M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z\" />\n          </svg>\n        </div>\n\n        <div className=\"bg-white p-6 rounded-lg shadow-md flex items-center justify-between\">\n          <div>\n            <p className=\"text-lg font-semibold text-gray-600\">Profit Margin</p>\n            <p className={`text-3xl font-bold mt-1 ${profitMargin >= 0 ? 'text-teal-600' : 'text-red-600'}`}>{profitMargin.toFixed(2)}%</p>\n          </div>\n          <svg xmlns=\"http://www.w3.org/2000/svg\" className={`h-10 w-10 ${profitMargin >= 0 ? 'text-teal-400' : 'text-red-400'}`} fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\">\n            <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth=\"2\" d=\"M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z\" />\n          </svg>\n        </div>\n      </div>\n\n      <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6\">\n        <div className=\"bg-white p-4 rounded-lg shadow-md\">\n          <h2 className=\"text-xl font-semibold text-gray-700 mb-4\">Sales by Region</h2>\n          <ResponsiveContainer width=\"100%\" height={300}>\n            <BarChart data={salesByRegion}>\n              <CartesianGrid strokeDasharray=\"3 3\" />\n              <XAxis dataKey=\"region\" angle={-15} textAnchor=\"end\" height={60} tick={{ fontSize: 12 }} label={{ value: \"Region\", position: \"insideBottom\", offset: 0, dy: 15 }} />\n              <YAxis label={{ value: \"Sales\", angle: -90, position: \"insideLeft\", dy: 15, dx: -10, fontSize: 12 }} tick={{ fontSize: 12 }} />\n              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />\n              <Legend />\n              <Bar dataKey=\"sales\" fill=\"#8884d8\" name=\"Total Sales\" />\n            </BarChart>\n          </ResponsiveContainer>\n        </div>\n\n        <div className=\"bg-white p-4 rounded-lg shadow-md\">\n          <h2 className=\"text-xl font-semibold text-gray-700 mb-4\">Profit by Product</h2>\n          <ResponsiveContainer width=\"100%\" height={300}>\n            <BarChart data={profitByProduct}>\n              <CartesianGrid strokeDasharray=\"3 3\" />\n              <XAxis dataKey=\"product\" angle={-15} textAnchor=\"end\" height={60} tick={{ fontSize: 12 }} label={{ value: \"Product\", position: \"insideBottom\", offset: 0, dy: 15 }} />\n              <YAxis label={{ value: \"Profit\", angle: -90, position: \"insideLeft\", dy: 15, dx: -10, fontSize: 12 }} tick={{ fontSize: 12 }} />\n              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />\n              <Legend />\n              <Bar dataKey=\"profit\" fill=\"#82ca9d\" name=\"Total Profit\" />\n            </BarChart>\n          </ResponsiveContainer>\n        </div>\n\n        <div className=\"bg-white p-4 rounded-lg shadow-md\">\n          <h2 className=\"text-xl font-semibold text-gray-700 mb-4\">Monthly Sales Trend</h2>\n          <ResponsiveContainer width=\"100%\" height={300}>\n            <LineChart data={salesOverTime}>\n              <CartesianGrid strokeDasharray=\"3 3\" />\n              <XAxis dataKey=\"monthYear\" tick={{ fontSize: 12 }} label={{ value: \"Month-Year\", position: \"insideBottom\", offset: 0, dy: 15 }} />\n              <YAxis label={{ value: \"Sales\", angle: -90, position: \"insideLeft\", dy: 15, dx: -10, fontSize: 12 }} tick={{ fontSize: 12 }} />\n              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />\n              <Legend />\n              <Line type=\"monotone\" dataKey=\"sales\" stroke=\"#ffc658\" name=\"Total Sales\" activeDot={{ r: 8 }} />\n            </LineChart>\n          </ResponsiveContainer>\n        </div>\n\n        <div className=\"bg-white p-4 rounded-lg shadow-md\">\n          <h2 className=\"text-xl font-semibold text-gray-700 mb-4\">Profit vs. Discount</h2>\n          <ResponsiveContainer width=\"100%\" height={300}>\n            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>\n              <CartesianGrid strokeDasharray=\"3 3\" />\n              <XAxis type=\"number\" dataKey=\"discount\" name=\"Discount\" unit=\"%\" label={{ value: \"Discount (%)\", position: \"insideBottom\", offset: 0, dy: 15 }} tick={{ fontSize: 12 }} />\n              <YAxis type=\"number\" dataKey=\"profit\" name=\"Profit\" unit=\"$\" label={{ value: \"Profit ($)\", angle: -90, position: \"insideLeft\", dy: 15, dx: -10, fontSize: 12 }} tick={{ fontSize: 12 }} />\n              <Tooltip cursor={{ strokeDasharray: \"3 3\" }} formatter={(value, name) => name === \"Profit\" ? `$${value.toLocaleString()}` : `${value}%`} />\n              <Legend />\n              <Scatter name=\"Profit vs. Discount\" data={profitVsDiscount} fill=\"#ff7300\" />\n            </ScatterChart>\n          </ResponsiveContainer>\n        </div>\n\n        <div className=\"bg-white p-4 rounded-lg shadow-md\">\n          <h2 className=\"text-xl font-semibold text-gray-700 mb-4\">Sales & Profit by Region</h2>\n          <ResponsiveContainer width=\"100%\" height={300}>\n            <ComposedChart data={salesProfitByRegion}>\n              <CartesianGrid strokeDasharray=\"3 3\" />\n              <XAxis dataKey=\"region\" angle={-15} textAnchor=\"end\" height={60} tick={{ fontSize: 12 }} label={{ value: \"Region\", position: \"insideBottom\", offset: 0, dy: 15 }} />\n              <YAxis yAxisId=\"left\" label={{ value: \"Sales\", angle: -90, position: \"insideLeft\", dy: 15, dx: -10, fontSize: 12 }} tick={{ fontSize: 12 }} />\n              <YAxis yAxisId=\"right\" orientation=\"right\" label={{ value: \"Profit\", angle: 90, position: \"insideRight\", dy: 15, dx: 10, fontSize: 12 }} tick={{ fontSize: 12 }} />\n              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />\n              <Legend />\n              <Bar yAxisId=\"left\" dataKey=\"sales\" fill=\"#8884d8\" name=\"Total Sales\" />\n              <Line yAxisId=\"right\" type=\"monotone\" dataKey=\"profit\" stroke=\"#ff7300\" name=\"Total Profit\" />\n            </ComposedChart>\n          </ResponsiveContainer>\n        </div>\n\n        <div className=\"bg-white p-4 rounded-lg shadow-md\">\n          <h2 className=\"text-xl font-semibold text-gray-700 mb-4\">Product Quantity Distribution</h2>\n          <ResponsiveContainer width=\"100%\" height={300}>\n            <PieChart>\n              <Pie\n                data={productQuantityDistribution}\n                dataKey=\"quantity\"\n                nameKey=\"product\"\n                cx=\"50%\"\n                cy=\"50%\"\n                outerRadius={100}\n                fill=\"#8884d8\"\n                label={(entry) => `${entry.product} (${entry.quantity})`}\n              >\n                {productQuantityDistribution.map((entry, index) => (\n                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />\n                ))}\n              </Pie>\n              <Tooltip formatter={(value) => `${value.toLocaleString()} units`} />\n              <Legend />\n            </PieChart>\n          </ResponsiveContainer>\n        </div>\n      </div>\n    </div>\n  );\n};\n\nexport default DashboardComponent;"

    # except Exception as e:
    #     raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")
    try:
         # Write to temp JSX file
        with tempfile.NamedTemporaryFile(suffix=".jsx", delete=False) as input_file:
            # input_file.write(analysis_result.dashboard_code.encode("utf-8"))
            input_file.write(analysis_result.encode("utf-8"))
            input_path = input_file.name

        with tempfile.NamedTemporaryFile(suffix=".js", delete=False) as output_file:
            output_path = output_file.name


        # Transpile with Babel
        result = subprocess.run(
            ["node", "transpile.js", input_path, output_path],
            cwd=backend_dir,
            capture_output=True,
            text=True,
            encoding="utf-8",
        )

        if result.returncode != 0:
            return JSONResponse(
                {"error": "transpile failed", "details": result.stderr},
                status_code=500,
            )

        with open(output_path, "r") as f:
            js_code = f.read()

        # return {"dashboard_code": js_code}
        # os.remove(input_path)
        # os.remove(output_path)
    

        # await db.refresh(analysis_result)
        await db.refresh(transaction)
        return AnalysisTransactionOut(
            user_id=transaction.user_id,
            transaction_id=transaction.id,
            dataset_name=transaction.file_name,
            requirements=transaction.user_query,
            dashboard_code=js_code
        )
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

@router.get("/dataset/{requirement_id}", status_code=200)
async def get_dataset_preview(
    requirement_id: int,
    # token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
):
    # user_services = UserServices(db)
    # current_user = await user_services.get_current_user(token)
    # if not current_user:
    #     raise HTTPException(status_code=401, detail="Unauthorized")

    transaction_service = TransactionService(db)
    transaction = await transaction_service.get_transaction(requirement_id)
    # if not transaction or transaction.user_id != current_user.id:
    #     raise HTTPException(status_code=404, detail="Transaction not found")


    try:
        df = pd.read_csv(transaction.file_path)


        df = df.replace([np.inf, -np.inf], np.nan)
        df = df.fillna(0)  # or use another placeholder

        # Convert to JSON-safe dict
        data = df.to_dict(orient="records")
        # preview = df.to_dict(orient="records")


    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File read error: {str(e)}")

    return JSONResponse(content=data)
    # return preview