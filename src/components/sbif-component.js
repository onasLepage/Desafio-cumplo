import React, { useState, Fragment } from "react";
import DatePicker, { registerLocale, setDefaultLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import es from "date-fns/locale/es";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import Loader from "react-loader-spinner";
import "../styles.scss";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

registerLocale("es", es);
setDefaultLocale("es");

const Sbif = () => {
  // estado de api dolar
  const [dolarState, setDolarState] = useState();

  // estado de fecha inicial
  const [startDate, setStartDate] = useState();

  // estado de fecha final
  const [endDate, setEndDate] = useState();

  // estado promedio
  const [averageTotal, setAverageTotal] = useState(0);

  const getDays = () => {
    let dayStart = startDate.getDate(),
      monthStart = startDate.getMonth() + 1,
      yearStart = startDate.getFullYear(),
      dayEnd = endDate.getDate(),
      monthEnd = endDate.getMonth() + 1,
      yearEnd = endDate.getFullYear();

    setDolarState(0);
    getDolarWithDate(
      dayStart,
      monthStart,
      yearStart,
      dayEnd,
      monthEnd,
      yearEnd
    );
  };

  let getAverage = formatValues => {
    let sum = formatValues
        .map(item => parseFloat(item.Valor))
        .reduce((acc, item) => item + acc, 0),
      objLength = Object.keys(formatValues).length,
      averageInit = sum / objLength;
    setAverageTotal(parseFloat(averageInit).toFixed(2));
  };

  const getDolarWithDate = async (
    dayStart,
    monthStart,
    yearStart,
    dayEnd,
    monthEnd,
    yearEnd
  ) => {
    const data = await fetch(
      `https://api.sbif.cl/api-sbifv3/recursos_api/dolar/periodo/${yearStart}/${monthStart}/dias_i/${dayStart}/${yearEnd}/${monthEnd}/dias_f/${dayEnd}?apikey=9c84db4d447c80c74961a72245371245cb7ac15f&formato=json`
    );

    const dolarValue = await data.json();
    let formatValues = await dolarValue.Dolares.map(item => {
      let formatedValue = item.Valor.replace(/,/g, ".");
      return {
        Valor: formatedValue,
        Fecha: item.Fecha
      };
    });
    getAverage(formatValues);
    setDolarState(formatValues);
  };

  return (
    <Fragment>
      <div className="container-header flex-row-wrap flex-justify-center">
        <img
          width="250px"
          src="http://www.sbif.cl/recursos/sbifweb3/img/logo/logo-CMF-blanco.png"
          alt="logo"
        />
      </div>
      <h2>Calculadora valor del dólar</h2>
      <div className="date-picker-wrapper flex-row-nowrap flex-justify-space-evenly my4">
        <div className="date-picker">
          <DatePicker
            dateFormat="dd-MM-yyyy"
            selected={startDate}
            showIcon={true}
            onChange={date => setStartDate(date)}
            maxDate={new Date()}
            placeholderText="Seleccione fecha inicial"
            isClearable
          />
        </div>

        <div className="date-picker">
          <DatePicker
            dateFormat="dd-MM-yyyy"
            selected={endDate}
            showIcon={true}
            onChange={date => setEndDate(date)}
            maxDate={new Date()}
            placeholderText="Seleccione fecha final"
            isClearable
          />
        </div>

        {startDate !== undefined &&
        startDate !== null &&
        endDate !== undefined &&
        endDate !== null ? (
          <div>
            <input
              className="btn"
              type="button"
              value="Calcular"
              onClick={getDays}
            />
          </div>
        ) : (
          ""
        )}
      </div>
      <h2>{averageTotal === 0 ? "" : ` Promedio : ${averageTotal}`}</h2>
      <div>
        {dolarState !== undefined ? (
          dolarState === 0 ? (
            <Loader type="Rings" color="#00a3da" height={80} width={80} />
          ) : (
            <ResponsiveContainer width="100%" aspect={7.0 / 3.0}>
              <LineChart
                data={dolarState}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis dataKey="Fecha" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Valor" stroke="#00a3da" />
              </LineChart>
            </ResponsiveContainer>
          )
        ) : (
          ""
        )}
      </div>
    </Fragment>
  );
};

export default Sbif;
