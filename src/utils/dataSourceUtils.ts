import axios from 'axios';
import * as XLSX from 'xlsx';
import { message } from 'antd';

interface ApiConfig {
  url: string;
  method?: string;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
}

export const fetchApiData = async (config: ApiConfig) => {
  try {
    const { url, method = 'GET', params, headers } = config;
    const response = await axios({
      url,
      method,
      params,
      headers
    });
    return response.data;
  } catch (error) {
    message.error('Failed to fetch API data');
    throw error;
  }
};

export const parseCsvData = async (config: Record<string, unknown>) => {
  try {
    const { file } = config;
    if (!(file instanceof File)) {
      throw new Error('Invalid file type');
    }

    const text = await file.text();
    const rows = text.split('\n').map(row => row.split(','));
    const headers = rows[0];
    const data = rows.slice(1).map(row => {
      return headers.reduce((obj, header, index) => {
        obj[header] = row[index];
        return obj;
      }, {} as Record<string, string>);
    });

    return data;
  } catch (error) {
    message.error('Failed to parse CSV data');
    throw error;
  }
};

export const parseExcelData = async (config: Record<string, unknown>) => {
  try {
    const { file } = config;
    if (!(file instanceof File)) {
      throw new Error('Invalid file type');
    }

    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(worksheet);
  } catch (error) {
    message.error('Failed to parse Excel data');
    throw error;
  }
};