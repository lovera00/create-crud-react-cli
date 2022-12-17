import React, { useCallback, useEffect, useMemo, useState } from 'react';
import MaterialReactTable from 'material-react-table';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    TextField,
    Tooltip,
} from '@mui/material';
import { Delete, Edit, PersonAdd, FileDownload, FileUpload, Refresh } from '@mui/icons-material';
import axios from 'axios';
import { ExportToCsv } from 'export-to-csv';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx/xlsx.mjs';
export const Listado{{endpoint}} = () => {
    //variable global para el prefijo de los endpoints
    const url = 'http://localhost:8080/api/v1/'+'{{endpoint}}'+'/';
    //fetch api
    const fetchListado = useCallback(async () => {
        const response = await axios.get(url);
        setTableData(response.data);
    }, []);
    useEffect(() => {
        fetchListado();
    }, [fetchListado]);
    const [createModalFileOpen, setCreateFileModalOpen] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [validationErrors, setValidationErrors] = useState({});
    const handleCreateNewRow = (values) => {
        tableData.push(values);
        setTableData([...tableData]);
    };
    const handleSaveRowEdits = async ({ exitEditingMode, row, values }) => {
        if (!Object.keys(validationErrors).length) {
            tableData[row.index] = values;
            const response = await axios.put(`${url}${values.id}`, values);
            console.log(response.data);
            setTableData([...tableData]);
            exitEditingMode();
        }
    };
    const handleDeleteRow = useCallback(
        (row) => {
            if (
                !window.confirm(`¿Desea eliminar el recurso ${row.getValue('{{deleteIdentificator}}')} ?`)
            ) {
                return;
            }
            //send api delete request here, then refetch or update local table data for re-render
            const response = axios.delete(`${url}${row.original.id}`)
            .then()
            .catch(alert("Existen usuarios asignados a ese rol, elimine las asignaciones e intente de nuevo"))
            console.log(response.data);
            tableData.splice(row.index, 1);
            setTableData([...tableData]);
        },
        [tableData],
    );
    const getCommonEditTextFieldProps = useCallback(
        (cell) => {
            return {
                error: !!validationErrors[cell.id],
                helperText: validationErrors[cell.id],
                onBlur: () => {
                    //remove validation error for cell if valid
                    delete validationErrors[cell.id];
                    setValidationErrors({
                        ...validationErrors,
                    });
                }
            }
        },
        [validationErrors],
    );
    const columns = useMemo(
        () => [
            {{columnas}}
            {{columnasEdit}}
        ],
        [getCommonEditTextFieldProps],
    );
    const csvOptions = {
        fieldSeparator: ',',
        quoteStrings: '"',
        decimalSeparator: '.',
        showLabels: true,
        useBom: true,
        useKeysAsHeaders: false,
        headers: tableData.map((c) => c.header),
    };
    const csvExporter = new ExportToCsv(csvOptions);
    const handleExportPDF = (rows) => {
        const doc = new jsPDF();
        const columns = [
            {{columnasPDF}}
        ];
        doc.autoTable(columns, rows);
        doc.save('exports.pdf');
    };
    const handleExportRows = (rows) => {
        csvExporter.generateCsv(rows.map((row) => row.original));
    };
    const handleExportData = () => {
        //headers
        const headers = [
            {{columnasExcel}}
        ];
        //data
        const data = tableData.map((row) => ({
            {{columnasRow}}
        }));
        //export
        const ws = XLSX.utils.json_to_sheet(data, { header: headers });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, '{{endpoint}}');
        XLSX.writeFile(wb, '{{endpoint}}.csv');
    };
    return (
        <>
            <MaterialReactTable
                displayColumnDefOptions={{
                    'mrt-row-actions': {
                        muiTableHeadCellProps: {
                            align: 'center',
                        },
                        size: 120,
                    },
                }}
                columns={columns}
                data={tableData}
                editingMode="modal" //default
                enableColumnOrdering
                enableEditing
                onEditingRowSave={handleSaveRowEdits}
                enableRowSelection
                renderRowActions={({ row, table }) => (
                    <Stack direction="row" justifyContent="center">
                        <Box sx={{ display: 'flex', gap: '1rem' }}>
                            <Tooltip arrow placement="left" title="Edit">
                                <IconButton onClick={() => table.setEditingRow(row)}>
                                    <Edit />
                                </IconButton>
                            </Tooltip>
                            <Tooltip arrow placement="right" title="Delete">
                                <IconButton color="error" onClick={() => handleDeleteRow(row)}>
                                    <Delete />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Stack>
                )}
                renderTopToolbarCustomActions={({ table }) => (
                    <Stack direction="row" spacing={1}>
                        <Button
                            color="primary"
                            onClick={() => setCreateModalOpen(true)}
                            variant="contained"
                        >
                            <PersonAdd></PersonAdd>Crear
                        </Button>
                        <Button
                            color="primary"
                            // if selected data use () => handleExportRows(table.getSelectedRowModel().rows)
                            // else use () => handleExportData()
                            onClick={
                                table.getSelectedRowModel().rows.length > 0
                                    ? () => handleExportRows(table.getSelectedRowModel().rows)
                                    : () => handleExportData()
                            }
                            variant="contained"
                        >
                            <FileDownload></FileDownload>CSV
                        </Button>
                        <Button
                            color="primary"
                            onClick={() => handleExportPDF(tableData)}
                            variant="contained"
                        >
                            <FileDownload></FileDownload>PDF
                        </Button>
                        <Button
                            color="primary"
                            onClick={() => setCreateFileModalOpen(true)}
                            variant="contained"
                        >
                            <FileUpload></FileUpload>Importar
                        </Button>
                        <Button
                            color="primary"
                            onClick={() => fetchListado()}
                            variant="contained"
                        >
                            <Refresh></Refresh>
                        </Button>
                    </Stack>
                )}
            />
            <CreateNewAccountModal
                columns={columns}
                open={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSubmit={handleCreateNewRow}
            />
            <CreateNewAccountModalFile
                columns={columns}
                open={createModalFileOpen}
                onClose={() => setCreateFileModalOpen(false)}
                onSubmit={handleCreateNewRow}
            />
        </>
    )
}
//example of creating a mui dialog modal for creating new rows
export const CreateNewAccountModal = ({ open, columns, onClose, onSubmit }) => {
    const [values, setValues] = useState(() =>
        columns.reduce((acc, column) => {
            acc[column.accessorKey ?? ''] = '';
            return acc;
        }, {}),
    );
    const handleSubmit = () => {
        console.log(values);
        axios.post(url, values)
            .then(function (response) {
                console.log(response);
                onSubmit(values);
                onClose();
            }
            )
            .catch(function (error) {
                console.log(error);
                alert("Error al crear el recurso");
            }
            );
    };
    return (
        <Dialog open={open}>
            <DialogTitle textAlign="center">Crear nuevo recurso</DialogTitle>
            <DialogContent>
                <form onSubmit={(e) => e.preventDefault()}>
                    <Stack
                        sx={{
                            width: '100%',
                            minWidth: { xs: '300px', sm: '360px', md: '400px' },
                            gap: '1.5rem',
                        }}
                    >
                        {{columnasForm}}
                    </Stack>
                </form>
            </DialogContent>
            <DialogActions sx={{ p: '1.25rem' }}>
                <Button onClick={onClose}>Cancel</Button>
                <Button color="secondary" onClick={handleSubmit} variant="contained">
                    Crear
                </Button>
            </DialogActions>
        </Dialog>
    );
};
//create modal for create input file
export const CreateNewAccountModalFile = ({ open, onClose }) => {
    const [colDef, setcolDef] = useState();
    const [data, setdata] = useState([]);
    const handleSubmitFile = () => {
        data.forEach(element => {
            axios.post(url, element)
                .then(function (response) {
                    onClose();
                }
                )
                .catch(function (error) {
                    console.log(error);
                }
                );
        });
    };
    const convertToJson = (headers, data) => {
        const rows = [];
        data.forEach((row) => {
            let rowData = {};
            row.forEach((element, index) => {
                rowData[headers[index]] = element;
            })
            rows.push(rowData);
        });
        return rows;
    }
    const importExcel = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (evt) => {
            /* Parse data */
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            /* Get first worksheet */
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            /* Convert array of arrays */
            const fileData = XLSX.utils.sheet_to_json(ws, { header: 1 });
            const headers = fileData[0]
            const heads = headers.map(head => ({ title: head, field: head }))
            setcolDef(heads)
            fileData.splice(0, 1)
            setdata(convertToJson(headers, fileData))
        }
        reader.readAsBinaryString(file);
    }
    return (
        <Dialog open={open}>
            <DialogTitle textAlign="center">Carga Masiva</DialogTitle>
            <DialogContent>
                {/* Show file data in MaterialReactTable */}
                <input
                    type="file"
                    accept=".csv"
                    onChange={importExcel}
                />
                {/* table */}
                <table>
                    <thead>
                        <tr>
                            {colDef && colDef.map((item, index) => (
                                <th key={index}>{item.title}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data && data.map((item, index) => (
                            <tr key={index}>
                                {colDef && colDef.map((head, i) => (
                                    <td key={i}>{item[head.field]}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </DialogContent>
            <DialogActions sx={{ p: '1.25rem' }}>
                <Button onClick={onClose}>Cancel</Button>
                <Button color="secondary" onClick={handleSubmitFile} variant="contained">
                    Guardar
                </Button>
            </DialogActions>
        </Dialog>
    );
};
export default Listado{{endpoint}};