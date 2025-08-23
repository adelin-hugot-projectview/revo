import { supabase } from '../supabase'
import { useState } from 'react'
import logo from '../public/logo.svg'

export default function Register() {
  const [formData, setFormData] = useState({
    societe: '',
    nom: '',
    prenom: '',
    email: '',
    password: ''
  })

  const [message, setMessage] = useState({ text: '', type: '' }) // type: 'success' | 'error'

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage({ text: '', type: '' })
    try {
      // 1. Sign up user with Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password
      })
      if (signUpError) {
        setMessage({ text: signUpError.message, type: 'error' })
        return
      }
      const user = signUpData?.user
      if (!user || !user.id) {
        setMessage({ text: "Erreur lors de la création de l'utilisateur.", type: 'error' })
        return
      }
      // 2. Insert société
      const { data: societeData, error: societeError } = await supabase
        .from('societe')
        .insert([{ nom: formData.societe }])
        .select()
        .single()
      if (societeError) {
        setMessage({ text: societeError.message, type: 'error' })
        return
      }
      const societeId = societeData?.id
      if (!societeId) {
        setMessage({ text: "Erreur lors de la création de la société.", type: 'error' })
        return
      }
      // 3. Insert utilisateur
      const { error: utilisateurError } = await supabase
        .from('utilisateur')
        .insert([{
          id: user.id,
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          role: 'admin',
          societe_id: societeId
        }])
      if (utilisateurError) {
        setMessage({ text: utilisateurError.message, type: 'error' })
        return
      }
      setMessage({ text: "Inscription réussie ! Vérifiez votre email pour valider votre compte.", type: 'success' })
      // Optionally reset form
      // setFormData({ societe: '', nom: '', prenom: '', email: '', password: '' })
    } catch (err) {
      setMessage({ text: "Erreur inattendue : " + err.message, type: 'error' })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E1F2EC]">
      <div className="bg-white p-10 rounded-xl shadow-lg max-w-md w-full">
        <img src={logo} alt="Logo REVO" className="mx-auto mb-6 w-24 h-24" />
        <h1 className="text-2xl font-bold text-[#2B5F4C] text-center mb-4">Créer un compte</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="societe"
            placeholder="Nom de la société"
            value={formData.societe}
            onChange={handleChange}
            className="border border-[#2B5F4C] px-4 py-2 rounded w-full"
          />
          <input
            type="text"
            name="nom"
            placeholder="Nom"
            value={formData.nom}
            onChange={handleChange}
            className="border border-[#2B5F4C] px-4 py-2 rounded w-full"
          />
          <input
            type="text"
            name="prenom"
            placeholder="Prénom"
            value={formData.prenom}
            onChange={handleChange}
            className="border border-[#2B5F4C] px-4 py-2 rounded w-full"
          />
          <input
            type="email"
            name="email"
            placeholder="Adresse email"
            value={formData.email}
            onChange={handleChange}
            className="border border-[#2B5F4C] px-4 py-2 rounded w-full"
          />
          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            value={formData.password}
            onChange={handleChange}
            className="border border-[#2B5F4C] px-4 py-2 rounded w-full"
          />
          <button type="submit" className="bg-[#2B5F4C] text-white py-2 px-4 rounded w-full">
            Créer mon compte
          </button>
        </form>
        {message.text && (
          <div
            className={`mt-4 text-center ${
              message.type === 'success' ? 'text-green-700' : 'text-red-600'
            }`}
          >
            {message.text}
          </div>
        )}
      </div>
    </div>
  )
}