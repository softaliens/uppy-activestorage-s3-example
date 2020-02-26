module ActiveStorage
  class Attached::Changes::CreateOne #:nodoc:
    def upload
      case attachable
      when ActionDispatch::Http::UploadedFile, Rack::Test::UploadedFile
        blob.upload_without_unfurling(attachable.open)
      when Hash
        blob.upload_without_unfurling(attachable.fetch(:io)) unless attachable.key?(:key_name)
      end
    end

    private
      def find_or_build_blob
        case attachable
        when ActiveStorage::Blob
          attachable
        when ActionDispatch::Http::UploadedFile, Rack::Test::UploadedFile
          ActiveStorage::Blob.build_after_unfurling \
            io: attachable.open,
            filename: attachable.original_filename,
            content_type: attachable.content_type
        when Hash
          if attachable.key?(:key_name)
            etag = attachable[:etag].remove(/\"/)
            ActiveStorage::Blob.new(
              key: attachable[:key_name],
              filename: attachable[:filename],
              content_type: attachable[:content_type],
              byte_size: attachable[:byte_size],
              checksum: [[etag].pack('H*')].pack('m0')
            )
          else
            ActiveStorage::Blob.build_after_unfurling(attachable)
          end
        when String
          ActiveStorage::Blob.find_signed(attachable)
        else
          raise ArgumentError, "Could not find or build blob: expected attachable, got #{attachable.inspect}"
        end
      end
  end
end