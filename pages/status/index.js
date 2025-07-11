function CapsLock(propriedades) {
  const textoEmCapsLock = propriedades.texto.toUpperCase();
  console.log(textoEmCapsLock);
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <CapsLock texto="teste de texto" />
    </>
  );
}
