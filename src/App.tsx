import { useState } from "react";
import "./App.css";

interface Passageiro {
  id: number;
  nome: string;
  cpf: string;
}

export default function App() {
  const [passageiros, setPassageiros] = useState<Passageiro[]>([]);
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [editId, setEditId] = useState<number | null>(null);

  // 🔍 VALIDAÇÃO REAL DE CPF (cálculo oficial)
  function validarCPF(cpf: string) {
    const strCPF = cpf.replace(/\D/g, "");

    if (strCPF.length !== 11) return false;

    if (
      [
        "00000000000",
        "11111111111",
        "22222222222",
        "33333333333",
        "44444444444",
        "55555555555",
        "66666666666",
        "77777777777",
        "88888888888",
        "99999999999",
      ].includes(strCPF)
    ) {
      return false;
    }

    let soma = 0;
    let resto;

    for (let i = 1; i <= 9; i++) {
      soma += parseInt(strCPF.substring(i - 1, i)) * (11 - i);
    }

    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(strCPF.substring(9, 10))) return false;

    soma = 0;

    for (let i = 1; i <= 10; i++) {
      soma += parseInt(strCPF.substring(i - 1, i)) * (12 - i);
    }

    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(strCPF.substring(10, 11))) return false;

    return true;
  }

  // ➕ ADICIONAR OU EDITAR
  function salvarPassageiro() {
    if (!nome.trim() || !cpf.trim()) {
      alert("Preencha nome e CPF");
      return;
    }

    const cpfNumerico = cpf.replace(/\D/g, "");

    if (!validarCPF(cpfNumerico)) {
      alert("CPF inválido! Digite um CPF real e válido.");
      return;
    }

    if (editId) {
      setPassageiros((prev) =>
        prev.map((p) =>
          p.id === editId ? { ...p, nome, cpf: cpfNumerico } : p
        )
      );
      setEditId(null);
    } else {
      setPassageiros([
        ...passageiros,
        { id: Date.now(), nome, cpf: cpfNumerico },
      ]);
    }

    setNome("");
    setCpf("");
  }

  // 🗑 EXCLUIR
  function excluir(id: number) {
    setPassageiros(passageiros.filter((p) => p.id !== id));
  }

  // ✏ EDITAR
  function editar(p: Passageiro) {
    setNome(p.nome);
    setCpf(p.cpf);
    setEditId(p.id);
  }

  // 🔄 LIMPAR LISTA
  function limparLista() {
    if (confirm("Deseja limpar a lista inteira?")) {
      setPassageiros([]);
    }
  }

  // 📄 GERAR CSV
  function gerarCSV() {
    if (passageiros.length === 0) return;

    const linhas = passageiros
      .map((p) => `${p.nome};${p.cpf}`)
      .join("\n");

    const blob = new Blob([linhas], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "passageiros.csv";
    a.click();

    URL.revokeObjectURL(url);
  }

  // 📤 COMPARTILHAR CSV
  async function compartilharCSV() {
    if (passageiros.length === 0) return;

    const linhas = passageiros
      .map((p) => `${p.nome};${p.cpf}`)
      .join("\n");

    const blob = new Blob([linhas], { type: "text/csv" });
    const arquivo = new File([blob], "passageiros.csv", {
      type: "text/csv",
    });

    if (navigator.canShare && navigator.canShare({ files: [arquivo] })) {
      await navigator.share({
        title: "Lista de Passageiros",
        files: [arquivo],
      });
    } else {
      alert("Seu dispositivo não suporta compartilhamento direto.");
    }
  }

  return (
    <div className="container">
      <h1>FOX Turismo</h1>
      <h3>Lista de Passageiros</h3>

      <input
        type="text"
        placeholder="Nome do passageiro"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
      />

      <input
        type="text"
        placeholder="CPF (somente números)"
        value={cpf}
        onChange={(e) => setCpf(e.target.value)}
      />

      <button className="btn btn-add" onClick={salvarPassageiro}>
        {editId ? "Salvar alterações" : "+ Adicionar Passageiro"}
      </button>

      {passageiros.map((p) => (
        <div key={p.id} className="passenger-card">
          <strong>{p.nome}</strong>
          <br />
          CPF: {p.cpf}
          <div className="actions">
            <button className="edit" onClick={() => editar(p)}>
              ✏ Editar
            </button>
            <button className="delete" onClick={() => excluir(p.id)}>
              🗑 Excluir
            </button>
          </div>
        </div>
      ))}

      <button className="btn btn-csv" onClick={gerarCSV}>
        📄 Gerar CSV
      </button>

      <button className="btn btn-csv" onClick={compartilharCSV}>
        📤 Compartilhar CSV
      </button>

      <button className="btn btn-clear" onClick={limparLista}>
        🗑 Limpar Lista
      </button>
    </div>
  );
}
