import React, { useState, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import { supabase } from '../../supabaseClient';

const PhotosTab = ({ site, onUpdateSite, colors }) => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [photos, setPhotos] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files);
        if (files.length > 0) {
            setSelectedFiles(prev => [...prev, ...files]);
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    useEffect(() => {
        // Récupérer l'utilisateur connecté et les photos
        const loadData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            
            if (site?.id) {
                await loadPhotos();
            }
            setLoading(false);
        };
        loadData();
    }, [site?.id]);

    const loadPhotos = async () => {
        if (!site?.id) return;
        
        const { data, error } = await supabase
            .from('site_media')
            .select('*')
            .eq('site_id', site.id)
            .eq('file_type', 'image')
            .order('created_at', { ascending: false });
            
        if (error) {
            console.error('Error loading photos:', error);
        } else {
            setPhotos(data || []);
        }
    };

    const handleRemovePreview = (indexToRemove) => {
        setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
        setPreviews(prev => {
            const newPreviews = prev.filter((_, index) => index !== indexToRemove);
            // Libère la mémoire de l'URL de l'aperçu supprimé
            URL.revokeObjectURL(previews[indexToRemove]);
            return newPreviews;
        });
    };
    
    const handleUpload = async () => {
        if (selectedFiles.length === 0 || !user) return;
        setIsUploading(true);

        try {
            for (const file of selectedFiles) {
                const fileName = `${site.id}/${Date.now()}-${file.name}`;
                
                // 1. Upload du fichier
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('photoschantier')
                    .upload(fileName, file);

                if (uploadError) {
                    console.error("Erreur d'upload:", uploadError);
                    continue;
                }

                // 2. Insertion dans site_media
                const { error: dbError } = await supabase
                    .from('site_media')
                    .insert({
                        site_id: site.id,
                        uploaded_by: user.id,
                        file_path: uploadData.path,
                        file_type: 'image',
                        mime_type: file.type,
                        file_size: file.size,
                        original_filename: file.name
                    });

                if (dbError) {
                    console.error("Erreur d'insertion en base:", dbError);
                }
            }

            // Recharger les photos
            await loadPhotos();
            alert(`${selectedFiles.length} photo(s) uploadée(s) avec succès !`);
            
        } catch (error) {
            console.error("Erreur globale d'upload:", error);
            alert("Une erreur majeure est survenue.");
        }

        setIsUploading(false);
        setSelectedFiles([]);
        previews.forEach(url => URL.revokeObjectURL(url));
        setPreviews([]);
    };

    return (
        <div className="space-y-6">
            <div>
                 <label htmlFor="photo-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload size={32} className="text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Cliquez pour téléverser</span> ou glissez-déposez</p>
                        <p className="text-xs text-gray-500">Plusieurs photos autorisées</p>
                    </div>
                    <input id="photo-upload" type="file" className="hidden" multiple onChange={handleFileSelect} accept="image/*" />
                </label>
            </div>
            
            {previews.length > 0 && (
                <div>
                    <h4 className="font-semibold mb-2 text-gray-700">À téléverser :</h4>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                        {previews.map((preview, index) => (
                            <div key={index} className="relative aspect-square">
                                <img src={preview} alt="Aperçu" className="w-full h-full object-cover rounded-lg"/>
                                <button onClick={() => handleRemovePreview(index)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 hover:bg-black/80 transition-colors">
                                    <X size={14}/>
                                </button>
                            </div>
                        ))}
                    </div>
                     <button onClick={handleUpload} disabled={isUploading} className="w-full mt-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 bg-primary">
                        {isUploading ? 'Téléversement...' : `Confirmer le téléversement de ${previews.length} photo(s)`}
                    </button>
                </div>
            )}

            <div>
                <h4 className="font-semibold mb-4 text-gray-700">Photos du chantier :</h4>
                {loading ? (
                    <p className="text-sm text-center text-gray-500 bg-gray-50 py-10 rounded-lg">Chargement des photos...</p>
                ) : photos.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {photos.map((photo) => {
                            const { data } = supabase.storage.from('photoschantier').getPublicUrl(photo.file_path);
                            return (
                                <div key={photo.id} className="relative aspect-square">
                                    <img 
                                        src={data.publicUrl} 
                                        alt={photo.original_filename || 'Photo du chantier'} 
                                        className="w-full h-full object-cover rounded-lg"
                                        title={photo.original_filename}
                                    />
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-sm text-center text-gray-500 bg-gray-50 py-10 rounded-lg">Aucune photo pour ce chantier.</p>
                )}
            </div>
        </div>
    );
};

export default PhotosTab;
