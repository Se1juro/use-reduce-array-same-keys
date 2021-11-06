console.time("loop");
const fs = require("fs");
try {
  const jsonString = fs.readFileSync("./json_sg.json");
  const rows = JSON.parse(jsonString);
  console.log("TAMAÑO", rows.length);
  const hash = Object.create(null);
  const indexed = rows.reduce((acc, el) => {
    if (!hash[el.DocumentoEmpresa]) {
      hash[el.DocumentoEmpresa] = {
        TipoSolicitud: el.TipoSolicitud,
        TipoDocumentoEmpresaPrincipal: el.TipoDocumentoEmpresaPrincipal,
        DocumentoEmpresaPrincipal: el.DocumentoEmpresaPrincipal,
        DocumentoEmpresa: el.DocumentoEmpresa,
        Accion: el.Accion,
      };

      const hashRegistros = Object.create(null);

      const filterEmpresas = rows
        .filter((element) => element.DocumentoEmpresa == el.DocumentoEmpresa)
        .map(({ DocumentoEmpresa, TipoDocumento, Documento, Periodo }) => ({
          DocumentoEmpresa,
          TipoDocumento,
          Documento,
          Periodo,
        }));

      const newRegistros = filterEmpresas.reduce((acc, el) => {
        if (!hashRegistros[el.Periodo]) {
          hashRegistros[el.Periodo] = {
            Periodo: el.Periodo,
          };
          const filterCotizantes = filterEmpresas
            .filter((item) => item.Periodo == el.Periodo)
            .map((item) => ({
              Documento: item.Documento,
              TipoDocumento: item.TipoDocumento,
            }));
          hashRegistros[el.Periodo].Cotizantes = filterCotizantes;
          return { ...acc, [el.DocumentoEmpresa]: hashRegistros[el.Periodo] };
        }

        return acc;
      }, {});
      const registrosToPush = newRegistros[el.DocumentoEmpresa];
      hash[el.DocumentoEmpresa].Registros = [registrosToPush];
      acc.push(hash[el.DocumentoEmpresa]);
    }
    return acc;
  }, []);
  let data = JSON.stringify(indexed);
  fs.writeFileSync("data-parsed.json", data);
} catch (err) {
  console.log(err);
  return;
}
console.timeEnd("loop");
